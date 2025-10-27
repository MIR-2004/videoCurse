import express, { Request, Response } from "express";
import prisma from "../prisma/client";

export const createEditJob = async (req: Request, res: Response) => {
    try {
        const {inputUrl, prompt} = req.body;

        if(!inputUrl || !prompt) {
            return res.status(400).json({message: "give all"});
        }

        const newJob = await prisma.editJob.create({
            data: {
                inputUrl,
                prompt
            }
        })

        res.status(200).json(newJob);
    } catch (error) {
        res.status(500).json({ error: "Failed to create job" });
    }
}