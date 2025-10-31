import express, { Request, Response } from "express";
import prisma from "../prisma/client";
import { JobStatus } from "@prisma/client";
import { parsePrompt } from "../services/llmParser";
import { processWithPython } from "../services/videoProcessor";
import { uploadToCloudinary } from "../services/cloudinaryUpload";
// import fs from "fs";

export const createEditJob = async (req: Request, res: Response) => {
    try {
        const prompt = req.body.prompt;
        const videoFile = req.file;

        if(!videoFile) {
            return res.status(400).json({ error: "No video file uploaded"});
        }

        const newJob = await prisma.editJob.create({
            data: {
                inputUrl: videoFile.path,
                prompt,
                status: JobStatus.PENDING
            }
        })

        const parsed = await parsePrompt(prompt);

        await prisma.editJob.update({
            where: {
                id: newJob.id
            },
            data: {
                status: JobStatus.PROCESSING,
                parsedCommand: parsed
            }
        })

        const outputPath = await processWithPython(videoFile.path, parsed);

        const uploaded = await uploadToCloudinary(outputPath);

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

        res.json({ success: true, jobId: newJob.id, outputUrl: uploaded.secure_url});
    } catch (error) {
        res.status(500).json({ error: "Failed to create job" });
    }
}