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

      // Validate the base64 string
      if (!base64Image || base64Image.trim() === "") {
        throw new Error("Invalid image data");
      }

      console.log("Sending request to OpenAI...");
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a dermatologist AI assistant. Analyze the skin in the image and provide detailed insights about skin health, concerns, and recommendations. Format your response in clear sections: 'Condition:', 'Concerns:', and 'Recommendations:'.",
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

      console.log("Received response from OpenAI");

      const analysis = response.choices[0].message.content;
      if (!analysis) {
        throw new Error("No analysis received from OpenAI");
      }

      console.log("Raw analysis:", analysis);

      // Initialize with default values
      const result: SkinAnalysisResult = {
        condition: "",
        concerns: [],
        recommendations: [],
        confidence: 0.95,
      };

      // Parse the response into structured data
      const sections = analysis.split("\n");
      let currentSection: "condition" | "concerns" | "recommendations" | null = null;

      for (const line of sections) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.toLowerCase().startsWith("condition:")) {
          currentSection = "condition";
          result.condition = trimmedLine.substring(10).trim();
        } else if (trimmedLine.toLowerCase().startsWith("concerns:")) {
          currentSection = "concerns";
        } else if (trimmedLine.toLowerCase().startsWith("recommendations:")) {
          currentSection = "recommendations";
        } else if (trimmedLine.startsWith("- ") && currentSection) {
          const item = trimmedLine.substring(2).trim();
          if (currentSection === "concerns") {
            result.concerns.push(item);
          } else if (currentSection === "recommendations") {
            result.recommendations.push(item);
          }
        } else if (trimmedLine && currentSection) {
          // Handle cases where bullet points aren't used
          if (currentSection === "condition" && !result.condition) {
            result.condition = trimmedLine;
          } else if (currentSection === "concerns") {
            result.concerns.push(trimmedLine);
          } else if (currentSection === "recommendations") {
            result.recommendations.push(trimmedLine);
          }
        }
      }

      // If no structured format was found, try to parse the whole text
      if (!result.condition && !result.concerns.length && !result.recommendations.length) {
        const lines = analysis.split("\n").filter(line => line.trim());
        if (lines.length >= 3) {
          result.condition = lines[0];
          result.concerns = [lines[1]];
          result.recommendations = [lines[2]];
        }
      }

      // Validate the result
      if (!result.condition || result.concerns.length === 0 || result.recommendations.length === 0) {
        console.error("Invalid analysis result:", result);
        throw new Error("Failed to parse analysis results");
      }

      console.log("Final parsed result:", result);
      return result;

    } catch (error) {
      console.error("Error in analyzeSkin:", error);
      if (error instanceof Error && error.message.includes("model")) {
        throw new Error("Service temporarily unavailable. Please try again later.");
      }
      throw new Error(
        error instanceof Error 
          ? error.message 
          : "Failed to analyze skin image"
      );
    }
  }
}

export default SkinAnalysisService;