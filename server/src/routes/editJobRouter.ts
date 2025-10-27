import { Router } from "express";
import { createEditJob } from "../controllers/videoController";

const router = Router();

router.post("/", createEditJob);

export default router;