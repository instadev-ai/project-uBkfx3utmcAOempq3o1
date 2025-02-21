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
    console.log("SkinAnalysisService constructor called");
    console.log("Testing log visibility");
    console.error("Testing error log visibility");

    if (!apiKey || apiKey.trim().length < 10) {
      throw new Error("Please enter a valid API key");
    }

    // Intentionally throwing an error to test logging
    console.log("About to throw a test error");
    throw new Error("This is a test error to check logging!");

    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  // ... rest of the code remains the same ...
}