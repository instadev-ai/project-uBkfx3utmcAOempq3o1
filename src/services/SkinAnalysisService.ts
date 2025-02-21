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
    if (!apiKey || apiKey.trim().length < 10) {
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
        model: "gpt-4o-mini",  // Using the correct model name
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

      console.log("Processing OpenAI response...");

      const analysis = response.choices[0]?.message?.content;
      if (!analysis) {
        throw new Error("No analysis received from OpenAI");
      }

      console.log("Raw analysis:", analysis);

      // Initialize result with default structure
      const result: SkinAnalysisResult = {
        condition: "Analysis in progress...",
        concerns: [],
        recommendations: [],
        confidence: 0.95
      };

      // Parse the raw text response
      const lines = analysis.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      // More flexible parsing approach
      let currentSection = 'condition';
      for (const line of lines) {
        if (line.toLowerCase().includes('condition') || line.toLowerCase().includes('characteristics')) {
          currentSection = 'condition';
          continue;
        }
        if (line.toLowerCase().includes('concern') || line.toLowerCase().includes('issue')) {
          currentSection = 'concerns';
          continue;
        }
        if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('suggest')) {
          currentSection = 'recommendations';
          continue;
        }

        // Add content to appropriate section
        if (currentSection === 'condition' && !result.condition) {
          result.condition = line;
        } else if (currentSection === 'concerns') {
          result.concerns.push(line);
        } else if (currentSection === 'recommendations') {
          result.recommendations.push(line);
        }
      }

      // If no structured format was found, try to parse the whole text
      if (!result.condition || result.concerns.length === 0 || result.recommendations.length === 0) {
        // Split the text into roughly three parts
        const textParts = analysis.split('.');
        const partSize = Math.ceil(textParts.length / 3);
        
        result.condition = textParts.slice(0, partSize).join('.').trim();
        result.concerns = [textParts.slice(partSize, partSize * 2).join('.').trim()];
        result.recommendations = [textParts.slice(partSize * 2).join('.').trim()];
      }

      // Final validation
      if (!result.condition) {
        result.condition = "Skin analysis completed";
      }
      if (result.concerns.length === 0) {
        result.concerns = ["No specific concerns identified"];
      }
      if (result.recommendations.length === 0) {
        result.recommendations = ["Maintain regular skincare routine"];
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