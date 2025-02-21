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
    if (!apiKey.startsWith('sk-')) {
      throw new Error("Invalid API key format. Please check your OpenAI API key.");
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

      // Validate the base64 string
      if (!base64Image || base64Image.trim() === "") {
        throw new Error("Invalid image data");
      }

      console.log("Preparing OpenAI request...");
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: "You are a dermatologist AI assistant. Analyze the skin in the image and provide insights about skin health.",
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
                text: "Analyze this skin image and provide:\n1. Condition: Overall skin condition\n2. Concerns: List main issues\n3. Recommendations: Suggest improvements",
              },
            ],
          },
        ],
        max_tokens: 500,
      });

      console.log("Processing OpenAI response...");

      const analysis = response.choices[0]?.message?.content;
      if (!analysis) {
        throw new Error("No analysis received from OpenAI");
      }

      console.log("Parsing analysis...");

      // Initialize result
      const result: SkinAnalysisResult = {
        condition: "",
        concerns: [],
        recommendations: [],
        confidence: 0.95,
      };

      // Split into sections and parse
      const sections = analysis.split("\n");
      let currentSection: "condition" | "concerns" | "recommendations" | null = null;

      for (const line of sections) {
        const trimmedLine = line.trim();
        
        // Skip empty lines
        if (!trimmedLine) continue;

        // Check for section headers
        if (trimmedLine.toLowerCase().startsWith("condition:")) {
          currentSection = "condition";
          const content = trimmedLine.substring(9).trim();
          if (content) result.condition = content;
          continue;
        }
        if (trimmedLine.toLowerCase().startsWith("concerns:")) {
          currentSection = "concerns";
          continue;
        }
        if (trimmedLine.toLowerCase().startsWith("recommendations:")) {
          currentSection = "recommendations";
          continue;
        }

        // Process content based on current section
        if (currentSection) {
          if (trimmedLine.startsWith("-") || trimmedLine.startsWith("•")) {
            const content = trimmedLine.substring(1).trim();
            if (content) {
              if (currentSection === "concerns") result.concerns.push(content);
              if (currentSection === "recommendations") result.recommendations.push(content);
            }
          } else if (!result.condition && currentSection === "condition") {
            result.condition = trimmedLine;
          } else if (currentSection === "concerns" && trimmedLine.length > 3) {
            result.concerns.push(trimmedLine);
          } else if (currentSection === "recommendations" && trimmedLine.length > 3) {
            result.recommendations.push(trimmedLine);
          }
        }
      }

      // Validate results
      if (!result.condition || result.concerns.length === 0 || result.recommendations.length === 0) {
        console.log("Incomplete analysis, attempting alternative parsing...");
        
        // Alternative parsing for unstructured responses
        const lines = analysis.split("\n").filter(line => line.trim());
        
        if (!result.condition && lines.length > 0) {
          result.condition = lines[0].replace(/^(condition:?\s*)/i, '').trim();
        }
        
        if (result.concerns.length === 0 && lines.length > 1) {
          const concernsText = lines.find(l => l.toLowerCase().includes("concern"))?.replace(/^(concerns:?\s*)/i, '').trim();
          if (concernsText) {
            result.concerns = [concernsText];
          }
        }
        
        if (result.recommendations.length === 0 && lines.length > 2) {
          const recsText = lines.find(l => l.toLowerCase().includes("recommend"))?.replace(/^(recommendations:?\s*)/i, '').trim();
          if (recsText) {
            result.recommendations = [recsText];
          }
        }
      }

      // Final validation
      if (!result.condition || result.concerns.length === 0 || result.recommendations.length === 0) {
        throw new Error("Could not extract complete analysis from the response");
      }

      console.log("Analysis completed successfully");
      return result;

    } catch (error) {
      console.error("Error in analyzeSkin:", error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          throw new Error("Invalid API key. Please check your OpenAI API key and try again.");
        }
        if (error.message.includes("insufficient_quota")) {
          throw new Error("OpenAI API quota exceeded. Please check your account balance.");
        }
        if (error.message.includes("rate_limit")) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        }
        if (error.message.includes("invalid_request_error")) {
          throw new Error("Invalid request. Please try with a different image.");
        }
        if (error.message.includes("model")) {
          throw new Error("Service configuration error. Please try again later.");
        }
        
        throw new Error(error.message);
      }
      
      throw new Error("An unexpected error occurred. Please try again.");
    }
  }
}

export default SkinAnalysisService;