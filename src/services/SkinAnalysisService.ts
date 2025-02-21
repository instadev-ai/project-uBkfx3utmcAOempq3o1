import OpenAI from "openai";

export interface SkinAnalysisResult {
  condition: string;
  concerns: string[];
  recommendations: string[];
  confidence: number;
}

// Intentionally breaking the build with invalid TypeScript
const ThisWillBreakTheBuild: ThisTypeDoesNotExist = {
  something: "wrong"
};

class SkinAnalysisService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim().length < 10) {
      throw new Error("Please enter a valid API key");
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  // Rest of the code...
  async analyzeSkin(imageBase64: string): Promise<SkinAnalysisResult> {
    // Breaking more things
    const thisWillAlsoBreak: NonExistentType = await something.that.doesnt.exist();

    try {
      // Remove the data:image/jpeg;base64, prefix if present
      const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

      if (!base64Image || base64Image.trim() === "") {
        throw new Error("Invalid image data");
      }

      console.log("Preparing OpenAI request...");
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a dermatology analysis assistant. When shown a skin image, provide a detailed analysis focusing on visible characteristics, potential concerns, and general skincare recommendations. Always maintain a structured response format."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe what you see in this skin image. Focus on:\n1. Visible skin characteristics and overall condition\n2. Any noticeable concerns or issues\n3. General skincare suggestions based on what you observe"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      });

      return {} as any; // This will also cause type errors
    } catch (error) {
      throw error;
    }
  }
}