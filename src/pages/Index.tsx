import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import ImageCapture from "@/components/ImageCapture";
import AnalysisResults from "@/components/AnalysisResults";
import ApiKeyInput from "@/components/ApiKeyInput";
import SkinAnalysisService from "@/services/SkinAnalysisService";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageCapture = async (imageData: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key first",
        variant: "destructive",
      });
      return;
    }

    setCurrentImage(imageData);
    setIsCapturing(false);
    setIsLoading(true);

    try {
      console.log("Starting analysis...");
      const analysisService = new SkinAnalysisService(apiKey);
      const result = await analysisService.analyzeSkin(imageData);
      console.log("Analysis completed:", result);
      
      setAnalysisResult(result);
      setIsAnalyzing(true);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error 
          ? error.message 
          : "Unable to analyze the image. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsCapturing(false);
    setIsAnalyzing(false);
    setCurrentImage(null);
    setAnalysisResult(null);
    setIsLoading(false);
  };

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    toast({
      title: "API Key Set",
      description: "You can now start analyzing skin images",
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 py-6 font-sans">
      <main className="mx-auto max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Skin Analysis</h1>
          <p className="mt-2 text-gray-600">
            Get instant insights about your skin health
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card className="overflow-hidden rounded-2xl border-0 bg-white p-6 shadow-lg">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800">
                Start Analysis
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Take or upload a photo of your face
              </p>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full bg-rose-500 hover:bg-rose-600 text-white h-12 rounded-xl"
                onClick={() => setIsCapturing(true)}
                disabled={!apiKey || isLoading}
              >
                {isLoading ? "Analyzing..." : "Take Photo"}
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50"
                onClick={() => setIsCapturing(true)}
                disabled={!apiKey || isLoading}
              >
                {isLoading ? "Analyzing..." : "Upload Photo"}
              </Button>
            </div>
          </Card>

          {/* Recent Card */}
          <Card className="overflow-hidden rounded-2xl border-0 bg-white p-6 shadow-lg">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-800">
                Recent Analysis
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                View your previous skin analyses
              </p>
            </div>

            <div className="text-center py-8 text-gray-500">
              <p>No recent analyses</p>
            </div>
          </Card>
        </div>
      </main>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 rounded-2xl border-0 bg-white shadow-2xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
              <p className="mt-4 text-gray-800 font-medium">Analyzing your skin...</p>
              <p className="mt-2 text-sm text-gray-600">This may take a few moments</p>
            </div>
          </Card>
        </div>
      )}

      {/* Camera/Upload Modal */}
      {isCapturing && (
        <ImageCapture
          onImageCapture={handleImageCapture}
          onClose={() => setIsCapturing(false)}
        />
      )}

      {/* Analysis Results */}
      {isAnalyzing && analysisResult && currentImage && (
        <AnalysisResults
          result={analysisResult}
          image={currentImage}
          onClose={handleClose}
        />
      )}

      {/* API Key Input */}
      {!apiKey && <ApiKeyInput onSubmit={handleApiKeySubmit} />}
    </div>
  );
};

export default Index;