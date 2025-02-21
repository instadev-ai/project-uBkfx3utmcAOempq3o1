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
    if (!apiKey || apiKey.trim().length < 10) {  // Just check if it's a reasonable length
      throw new Error("Please enter a valid API key");
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  async analyzeSkin(imageBase64: string): Promise<SkinAnalysisResult> {
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
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this skin image and provide a detailed assessment in this format:\nCondition: (describe overall condition)\nConcerns: (list main issues)\nRecommendations: (list suggestions)"
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

      console.log("Processing OpenAI response...");

      const analysis = response.choices[0]?.message?.content;
      if (!analysis) {
        throw new Error("No analysis received from OpenAI");
      }

      console.log("Raw analysis:", analysis);

      // Initialize result
      const result: SkinAnalysisResult = {
        condition: "",
        concerns: [],
        recommendations: [],
        confidence: 0.95
      };

      // Parse the response
      const sections = analysis.split('\n');
      let currentSection: 'condition' | 'concerns' | 'recommendations' | null = null;

      for (const line of sections) {
        const trimmedLine = line.trim().toLowerCase();
        
        if (trimmedLine.startsWith('condition:')) {
          currentSection = 'condition';
          result.condition = line.substring(line.indexOf(':') + 1).trim();
        } else if (trimmedLine.startsWith('concerns:')) {
          currentSection = 'concerns';
        } else if (trimmedLine.startsWith('recommendations:')) {
          currentSection = 'recommendations';
        } else if (trimmedLine && currentSection) {
          if (currentSection === 'concerns' && !trimmedLine.startsWith('recommendations:')) {
            result.concerns.push(line.trim());
          } else if (currentSection === 'recommendations') {
            result.recommendations.push(line.trim());
          }
        }
      }

      // Clean up the lists (remove empty items and bullet points)
      result.concerns = result.concerns
        .map(item => item.replace(/^[-•*]\s*/, ''))
        .filter(item => item.length > 0);
      
      result.recommendations = result.recommendations
        .map(item => item.replace(/^[-•*]\s*/, ''))
        .filter(item => item.length > 0);

      // Validate the result
      if (!result.condition || result.concerns.length === 0 || result.recommendations.length === 0) {
        throw new Error("Failed to parse analysis results");
      }

      console.log("Final parsed result:", result);
      return result;

    } catch (error) {
      console.error("Error details:", error);

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error("Invalid API key. Please check your OpenAI API key.");
        }
        if (error.message.includes('insufficient_quota')) {
          throw new Error("Your OpenAI API quota has been exceeded. Please check your billing.");
        }
        if (error.message.includes('rate_limit')) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        }
        if (error.message.includes('model_not_found') || error.message.includes('has been deprecated')) {
          throw new Error("The AI service is temporarily unavailable. Please try again later.");
        }
        throw error;
      }

      throw new Error("An unexpected error occurred. Please try again.");
    }
  }
}

export default SkinAnalysisService;