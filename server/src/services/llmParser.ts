import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const parsePrompt = async (prompt: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a strict video editing command parser. Output only JSON in this format: { actions: [ { action: 'adjust_contrast' | 'trim' | 'brightness', value: number } ] }",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content || "{}");
};

export const llmParser = {
  async parseEditInstructions(
    prompt: string,
    videoPath?: string
  ): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an AI video editor assistant. Analyze the user's request and generate video editing actions.
                        
                        Available actions:
                        - cut_section: Remove a section (requires start_time, end_time)
                        - brightness: Adjust brightness (requires value: 0.5-2.0)
                        - volume: Adjust volume (requires value: 0.0-3.0)
                        - blur: Apply blur effect (requires start_time, end_time)
                        - trim: Trim video to specific duration (requires start_time, end_time)
                        
                        Return JSON in this format:
                        {
                          "actions": [
                            {"action": "cut_section", "start_time": 15, "end_time": 22},
                            {"action": "brightness", "value": 1.2},
                            {"action": "volume", "value": 1.5}
                          ],
                          "suggestions": ["Added brightness boost", "Increased volume for clarity"]
                        }`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return JSON.parse(
        response.choices[0].message.content ||
          '{"actions": [], "suggestions": []}'
      );
    } catch (error) {
      console.error("LLM parsing error:", error);
      return { actions: [], suggestions: ["Failed to analyze video"] };
    }
  },
};
