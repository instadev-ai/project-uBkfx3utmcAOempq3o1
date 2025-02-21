import OpenAI from "openai";

export interface SkinAnalysisResult {
  condition: string;
  concerns: string[];
  recommendations: string[];
  confidence: number;
}

class SkinAnalysisService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Note: This is temporary for the prototype
    });
  }

  async analyzeSkin(imageBase64: string): Promise<SkinAnalysisResult> {
    try {
      // Remove the data:image/jpeg;base64, prefix if present
      const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a dermatologist AI assistant. Analyze the skin in the image and provide detailed insights about skin health, concerns, and recommendations.",
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
              {
                type: "text",
                text: "Please analyze this skin image and provide: 1) Overall skin condition 2) Key concerns 3) Specific recommendations for improvement. Be concise but thorough.",
              },
            ],
          },
        ],
        max_tokens: 500,
      });

      const analysis = response.choices[0].message.content;
      
      // Parse the response into structured data
      // This is a simple parsing example - you might want to make it more sophisticated
      const result: SkinAnalysisResult = {
        condition: "Analyzed",
        concerns: ["Analyzing your skin..."],
        recommendations: ["Processing recommendations..."],
        confidence: 0.95,
      };

      if (analysis) {
        const sections = analysis.split("\n\n");
        sections.forEach((section) => {
          if (section.toLowerCase().includes("condition")) {
            result.condition = section.split(":")[1]?.trim() || result.condition;
          } else if (section.toLowerCase().includes("concerns")) {
            result.concerns = section
              .split(":")[1]
              ?.split("-")
              .map((s) => s.trim())
              .filter(Boolean) || result.concerns;
          } else if (section.toLowerCase().includes("recommendations")) {
            result.recommendations = section
              .split(":")[1]
              ?.split("-")
              .map((s) => s.trim())
              .filter(Boolean) || result.recommendations;
          }
        });
      }

      return result;
    } catch (error) {
      console.error("Error analyzing skin:", error);
      throw new Error("Failed to analyze skin image");
    }
  }
}

export default SkinAnalysisService;