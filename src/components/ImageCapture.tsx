import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useToast } from "./ui/use-toast";

interface ImageCaptureProps {
  onImageCapture: (image: string) => void;
  onClose: () => void;
}

const ImageCapture = ({ onImageCapture, onClose }: ImageCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsStreamActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreamActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        onImageCapture(imageData);
        stopCamera();
      }
    }
  };

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate image
    const isValid = await validateImage(file);
    if (!isValid) {
      toast({
        title: "Invalid Image",
        description: "The selected file appears to be corrupted",
        variant: "destructive",
      });
      return;
    }

    // Process valid image
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result as string;
      onImageCapture(imageData);
    };
    reader.onerror = () => {
      toast({
        title: "Upload Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-0 bg-white p-6 shadow-2xl">
      <div className="relative">
        <div className="absolute right-0 top-0">
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

        <div className="mb-6 mt-2 text-center">
          <h2 className="text-xl font-semibold text-gray-800">Take a Photo</h2>
          <p className="mt-2 text-sm text-gray-600">
            Position your face clearly in the frame
          </p>
        </div>

        {isStreamActive ? (
          <div className="relative mb-6 overflow-hidden rounded-2xl bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-[400px] w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-6 flex h-[400px] items-center justify-center rounded-2xl bg-gray-100">
            <div className="text-center text-gray-500">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
              <p className="mt-2">Camera preview will appear here</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {!isStreamActive ? (
            <Button
              className="h-12 w-full rounded-xl bg-rose-500 text-white hover:bg-rose-600"
              onClick={startCamera}
            >
              Start Camera
            </Button>
          ) : (
            <Button
              className="h-12 w-full rounded-xl bg-rose-500 text-white hover:bg-rose-600"
              onClick={captureImage}
            >
              Capture Photo
            </Button>
          )}

          <div className="relative">
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50"
            >
              Upload Photo
            </Button>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ImageCapture;