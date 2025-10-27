import express, { Request, Response } from "express";
import prisma from "../prisma/client";
import { JobStatus } from "@prisma/client";

export const createEditJob = async (req: Request, res: Response) => {
    try {
        const prompt = req.body.prompt;
        const inputPath = req.file?.path;

        if(!inputPath || !prompt) {
            return res.status(400).json({message: "give all"});
        }

        const newJob = await prisma.editJob.create({
            data: {
                inputUrl: inputPath,
                prompt,
                status: JobStatus.PROCESSING
            }
        })

        res.status(200).json(newJob);
    } catch (error) {
        res.status(500).json({ error: "Failed to create job" });
    }
}