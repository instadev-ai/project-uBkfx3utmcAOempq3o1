import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { useToast } from "./ui/use-toast";

interface ApiKeyInputProps {
  onSubmit: (apiKey: string) => void;
}

const ApiKeyInput = ({ onSubmit }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to continue",
        variant: "destructive",
      });
      return;
    }
    onSubmit(apiKey);
  };

  return (
    <Card className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-0 bg-white p-6 shadow-2xl">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">OpenAI API Key</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your API key to enable skin analysis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="h-12 rounded-xl border-rose-200 bg-rose-50/50 placeholder:text-rose-300"
          />
          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-rose-500 text-white hover:bg-rose-600"
          >
            Start Analysis
          </Button>
        </form>

        <p className="text-xs text-center text-gray-500">
          Your API key is only used locally and never stored on any server
        </p>
      </div>
    </Card>
  );
};

export default ApiKeyInput;