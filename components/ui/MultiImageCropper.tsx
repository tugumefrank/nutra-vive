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
import { Progress } from "@/components/ui/progress";
import { 
  Crop as CropIcon, 
  RotateCcw, 
  Check, 
  X, 
  ArrowLeft, 
  ArrowRight,
  Image as ImageIcon 
} from "lucide-react";
import "react-image-crop/dist/ReactCrop.css";

interface FileWithUrl {
  file: File;
  url: string;
}

interface MultiImageCropperProps {
  files: FileWithUrl[];
  onCropComplete: (croppedFiles: File[]) => void;
  onCancel: () => void;
  isOpen: boolean;
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

export function MultiImageCropper({
  files,
  onCropComplete,
  onCancel,
  isOpen,
}: MultiImageCropperProps): JSX.Element {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [croppedFiles, setCroppedFiles] = useState<File[]>([]);
  const [processedCount, setProcessedCount] = useState<number>(0);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentFile = files[currentImageIndex];
  const totalFiles = files.length;
  const progressPercentage = (processedCount / totalFiles) * 100;

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerAspectCrop(width, height, ASPECT_RATIO);
    setCrop(crop);
  }, []);

  const cropCurrentImage = useCallback(async (): Promise<File | null> => {
    if (!completedCrop || !imgRef.current || !canvasRef.current || !currentFile) {
      return null;
    }

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

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob: Blob | null): void => {
          if (!blob) {
            resolve(null);
            return;
          }

          const croppedFile = new File(
            [blob],
            `cropped_${currentFile.file.name}`,
            {
              type: "image/jpeg",
              lastModified: Date.now(),
            }
          );

          resolve(croppedFile);
        },
        "image/jpeg",
        0.95,
      );
    });
  }, [completedCrop, currentFile]);

  const handleCropNext = useCallback(async (): Promise<void> => {
    if (!completedCrop) return;

    setIsProcessing(true);

    try {
      const croppedFile = await cropCurrentImage();
      if (!croppedFile) {
        setIsProcessing(false);
        return;
      }

      const newCroppedFiles = [...croppedFiles, croppedFile];
      setCroppedFiles(newCroppedFiles);
      setProcessedCount(prev => prev + 1);

      // Check if this is the last image
      if (currentImageIndex === totalFiles - 1) {
        // All images processed
        onCropComplete(newCroppedFiles);
        setIsProcessing(false);
        return;
      }

      // Move to next image
      setCurrentImageIndex(prev => prev + 1);
      setCompletedCrop(undefined);
      setCrop(undefined);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error processing crop:", error);
      setIsProcessing(false);
    }
  }, [completedCrop, cropCurrentImage, croppedFiles, currentImageIndex, totalFiles, onCropComplete]);

  const handlePrevious = useCallback((): void => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      setCompletedCrop(undefined);
      setCrop(undefined);
      // Remove the last cropped file if going back
      setCroppedFiles(prev => prev.slice(0, -1));
      setProcessedCount(prev => Math.max(0, prev - 1));
    }
  }, [currentImageIndex]);

  const handleReset = useCallback((): void => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const newCrop = centerAspectCrop(width, height, ASPECT_RATIO);
      setCrop(newCrop);
      setCompletedCrop(undefined);
    }
  }, []);

  const handleCancel = useCallback((): void => {
    // Reset all states
    setCurrentImageIndex(0);
    setCroppedFiles([]);
    setProcessedCount(0);
    setCompletedCrop(undefined);
    setCrop(undefined);
    onCancel();
  }, [onCancel]);

  if (!currentFile) {
    return <></>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => !isProcessing && handleCancel()}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            Crop Product Images ({currentImageIndex + 1} of {totalFiles})
          </DialogTitle>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Crop your images to {RECOMMENDED_DIMENSIONS.width}x{RECOMMENDED_DIMENSIONS.height} pixels 
              for optimal product card display.
            </p>
            <div className="flex items-center gap-2">
              <Progress value={progressPercentage} className="flex-1" />
              <span className="text-sm text-muted-foreground">
                {processedCount}/{totalFiles} completed
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span>Current: {currentFile.file.name}</span>
          </div>

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
                src={currentFile.url}
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
                  handlePrevious();
                }}
                disabled={isProcessing || currentImageIndex === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleCancel();
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
                  handleCropNext();
                }}
                disabled={!completedCrop || isProcessing}
                className="flex items-center gap-2"
              >
                {currentImageIndex === totalFiles - 1 ? (
                  <>
                    <Check className="h-4 w-4" />
                    {isProcessing ? "Processing..." : "Finish"}
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    {isProcessing ? "Processing..." : "Next"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}