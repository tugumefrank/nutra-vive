"use client";

import { useState, useRef, useCallback } from "react";
import type { JSX } from "react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crop as CropIcon, RotateCcw, Check, X } from "lucide-react";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedImageFile: File) => void;
  onCancel: () => void;
  isOpen: boolean;
  fileName: string;
}

// Recommended dimensions for product cards (800x800 square)
const RECOMMENDED_DIMENSIONS = {
  width: 800,
  height: 800,
} as const;

const ASPECT_RATIO = 1; // 1:1 square aspect ratio

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function ImageCropper({
  src,
  onCropComplete,
  onCancel,
  isOpen,
  fileName,
}: ImageCropperProps): JSX.Element {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerAspectCrop(width, height, ASPECT_RATIO);
    setCrop(crop);
  }, []);

  const handleCropComplete = useCallback(async (): Promise<void> => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }

    setIsProcessing(true);

    try {
      const image = imgRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("No 2d context");
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Set canvas dimensions to recommended product card size
      canvas.width = RECOMMENDED_DIMENSIONS.width;
      canvas.height = RECOMMENDED_DIMENSIONS.height;

      // Configure high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw the cropped image
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        RECOMMENDED_DIMENSIONS.width,
        RECOMMENDED_DIMENSIONS.height,
      );

      // Convert canvas to blob with high quality
      canvas.toBlob(
        (blob: Blob | null): void => {
          if (!blob) {
            console.error("Canvas is empty");
            setIsProcessing(false);
            return;
          }

          // Create a new file with the cropped image
          const croppedFile = new File(
            [blob],
            `cropped_${fileName}`,
            {
              type: "image/jpeg",
              lastModified: Date.now(),
            }
          );

          onCropComplete(croppedFile);
          setIsProcessing(false);
        },
        "image/jpeg",
        0.95, // High quality JPEG
      );
    } catch (error) {
      console.error("Error processing crop:", error);
      setIsProcessing(false);
    }
  }, [completedCrop, onCropComplete, fileName]);

  const handleReset = useCallback((): void => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const newCrop = centerAspectCrop(width, height, ASPECT_RATIO);
      setCrop(newCrop);
      setCompletedCrop(undefined);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={() => !isProcessing && onCancel()}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            Crop Product Image
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Crop your image to {RECOMMENDED_DIMENSIONS.width}x{RECOMMENDED_DIMENSIONS.height} pixels 
            for optimal product card display. The cropped area will be automatically resized.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={ASPECT_RATIO}
              minWidth={50}
              minHeight={50}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={src}
                style={{ maxWidth: "100%", maxHeight: "60vh" }}
                onLoad={onImageLoad}
                className="object-contain"
              />
            </ReactCrop>
          </div>

          {/* Hidden canvas for processing */}
          <canvas
            ref={canvasRef}
            style={{ display: "none" }}
          />

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Target size: {RECOMMENDED_DIMENSIONS.width}×{RECOMMENDED_DIMENSIONS.height}px (Square format)
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleReset();
                }}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onCancel();
                }}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleCropComplete();
                }}
                disabled={!completedCrop || isProcessing}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                {isProcessing ? "Processing..." : "Apply Crop"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}