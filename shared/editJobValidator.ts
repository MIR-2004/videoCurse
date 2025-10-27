import { z } from "zod";

export const EditJobValidator = z.object({
  inputUrl: z
    .string()
    .url("Invalid input URL")
    .nonempty("Input URL is required"),

  outputUrl: z
    .string()
    .url("Invalid output URL")
    .optional(),

  prompt: z
    .string()
    .min(3, "Prompt must be at least 3 characters long"),

  parsedCommand: z
    .record(z.any())
    .optional(),

  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]).optional(),
});

export type EditJobInput = z.infer<typeof EditJobValidator>;
