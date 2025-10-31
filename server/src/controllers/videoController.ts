import express, { Request, Response } from "express";
import { randomUUID } from "crypto";
import prisma from "../prisma/client";
import { JobStatus, Prisma } from "@prisma/client";
import { parsePrompt } from "../services/llmParser";
import { processWithPython } from "../services/videoProcessor";
import { uploadToCloudinary } from "../services/cloudinaryUpload";
// import fs from "fs";

export const createEditJob = async (req: Request, res: Response) => {
    const requestId = randomUUID();
    let jobId: string | null = null;
    try {
        const prompt = req.body.prompt;
        const videoFile = req.file;

        if (typeof prompt !== "string" || prompt.trim().length === 0) {
            console.warn(`[createEditJob] [${requestId}] Invalid or empty prompt`, {
                promptType: typeof prompt,
            });
            return res.status(400).json({ error: "Prompt is required" });
        }

        const normalizedPrompt = prompt.trim();

        console.info(`[createEditJob] [${requestId}] Received request`, {
            hasPrompt: typeof prompt === "string",
            promptPreview: normalizedPrompt.slice(0, 120),
            file: videoFile
                ? {
                    originalName: videoFile.originalname,
                    size: videoFile.size,
                    mimetype: videoFile.mimetype,
                }
                : null,
        });

        if(!videoFile) {
            console.warn(`[createEditJob] [${requestId}] No video file uploaded`);
            return res.status(400).json({ error: "No video file uploaded"});
        }

        const newJob = await prisma.editJob.create({
            data: {
                inputUrl: videoFile.path,
                prompt: normalizedPrompt,
                status: JobStatus.PENDING
            }
        })

        jobId = newJob.id;

        console.info(`[createEditJob] [${requestId}] Created edit job`, {
            jobId: newJob.id,
            inputPath: newJob.inputUrl,
        });

        let parsed;
        try {
            parsed = await parsePrompt(normalizedPrompt);
        } catch (parseError) {
            console.error(`[createEditJob] [${requestId}] Prompt parsing failed`, {
                jobId: newJob.id,
                error:
                    parseError instanceof Error
                        ? { message: parseError.message, stack: parseError.stack }
                        : parseError,
            });
            throw new Error("Failed to parse edit instructions");
        }

        if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as any).actions)) {
            console.error(`[createEditJob] [${requestId}] Invalid parsed prompt format`, {
                jobId: newJob.id,
                parsed,
            });
            throw new Error("Parsed prompt is in an invalid format");
        }

        const parsedCommand = parsed as { actions: unknown[] };

        console.info(`[createEditJob] [${requestId}] Parsed prompt`, {
            jobId: newJob.id,
            parsedCommand,
        });

        await prisma.editJob.update({
            where: {
                id: newJob.id
            },
            data: {
                status: JobStatus.PROCESSING,
                parsedCommand: parsedCommand as unknown as Prisma.InputJsonValue
            }
        })

        console.info(`[createEditJob] [${requestId}] Job marked as PROCESSING`, {
            jobId: newJob.id,
        });

        const outputPath = await processWithPython(videoFile.path, parsedCommand);

        console.info(`[createEditJob] [${requestId}] Video processed via Python`, {
            jobId: newJob.id,
            outputPath,
        });

        const uploaded = await uploadToCloudinary(outputPath);

        console.info(`[createEditJob] [${requestId}] Uploaded processed video to Cloudinary`, {
            jobId: newJob.id,
            cloudinaryPublicId: uploaded.public_id,
            secureUrl: uploaded.secure_url,
        });

        // fs.unlinkSync(videoFile.path);
        // fs.unlinkSync(outputPath);

        await prisma.editJob.update({
            where: {
                id: newJob.id
            },
            data: {
                outputUrl: uploaded.secure_url,
                status: JobStatus.COMPLETED
            }
        })

        console.info(`[createEditJob] [${requestId}] Job completed`, {
            jobId: newJob.id,
            outputUrl: uploaded.secure_url,
        });

        res.json({ success: true, jobId: newJob.id, outputUrl: uploaded.secure_url});
    } catch (error) {
        if (jobId) {
            try {
                await prisma.editJob.update({
                    where: { id: jobId },
                    data: { status: JobStatus.FAILED },
                });
            } catch (statusError) {
                console.error(`[createEditJob] [${requestId}] Failed to mark job as FAILED`, {
                    jobId,
                    error:
                        statusError instanceof Error
                            ? { message: statusError.message, stack: statusError.stack }
                            : statusError,
                });
            }
        }

        console.error(`[createEditJob] [${requestId}] Failed to create job`, {
            error:
                error instanceof Error
                    ? { message: error.message, stack: error.stack }
                    : error,
        });
        const message = error instanceof Error ? error.message : "Failed to create job";
        res.status(500).json({ error: message, jobId });
    }
}