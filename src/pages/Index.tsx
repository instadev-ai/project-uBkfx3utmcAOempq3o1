import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 py-6 font-sans">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-800">Skin Health AI</h1>
        <p className="mt-2 text-sm text-gray-600">
          Analyze your skin health with AI
        </p>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-md">
        <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-lg">
          <div className="p-6">
            <div className="mb-6 text-center">
              <div className="mb-4 rounded-full bg-rose-50 p-4 inline-block">
                <svg
                  className="h-8 w-8 text-rose-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-gray-800">
                Take or Upload a Photo
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Get instant analysis of your skin health
              </p>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full bg-rose-500 hover:bg-rose-600 text-white h-12 rounded-xl"
                onClick={() => setIsAnalyzing(true)}
              >
                Take Photo
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50"
              >
                Upload Photo
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent Analysis Section */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-medium text-gray-800">
            Recent Analysis
          </h3>
          <div className="space-y-4">
            <Card className="p-4 rounded-xl border-0 shadow-sm">
              <p className="text-sm text-gray-600">No recent analysis</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;