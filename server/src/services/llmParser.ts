import dotenv from "dotenv";
dotenv.config(); // load here too ✅

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export const parsePrompt = async (prompt: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a strict video editing command parser. Output only JSON in this format: { actions: [ { action: 'adjust_contrast' | 'trim' | 'brightness', value: number } ] }"
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}
