import { Card } from "./ui/card";
import { Button } from "./ui/button";
import type { SkinAnalysisResult } from "@/services/SkinAnalysisService";

interface AnalysisResultsProps {
  result: SkinAnalysisResult;
  image: string;
  onClose: () => void;
}

const AnalysisResults = ({ result, image, onClose }: AnalysisResultsProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Analysis Results</h2>
          <Button
            variant="ghost"
            className="rounded-full p-2 text-gray-500"
            onClick={onClose}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        {/* Image Preview */}
        <div className="mb-6 rounded-2xl overflow-hidden">
          <img
            src={image}
            alt="Analyzed skin"
            className="w-full h-[200px] object-cover"
          />
        </div>

        {/* Analysis Cards */}
        <div className="space-y-6">
          {/* Overall Condition */}
          <Card className="p-6 rounded-2xl border-0 shadow-lg bg-rose-50">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Overall Condition
            </h3>
            <p className="text-gray-600">{result.condition}</p>
            <div className="mt-4 bg-white rounded-full h-2">
              <div
                className="bg-rose-500 h-2 rounded-full"
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {Math.round(result.confidence * 100)}% confidence
            </p>
          </Card>

          {/* Concerns */}
          <Card className="p-6 rounded-2xl border-0 shadow-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Key Concerns
            </h3>
            <ul className="space-y-3">
              {result.concerns.map((concern, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center mr-3">
                    <span className="text-rose-500 text-sm">
                      {index + 1}
                    </span>
                  </span>
                  <span className="text-gray-600">{concern}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Recommendations */}
          <Card className="p-6 rounded-2xl border-0 shadow-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Recommendations
            </h3>
            <ul className="space-y-3">
              {result.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg
                      className="h-4 w-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span className="text-gray-600">{recommendation}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <Button
            className="w-full h-12 rounded-xl bg-rose-500 text-white hover:bg-rose-600"
            onClick={onClose}
          >
            New Analysis
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50"
          >
            Save Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;