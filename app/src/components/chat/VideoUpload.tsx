"use client";

/**
 * VideoUpload component for attaching reference videos.
 * Handles drag-and-drop and click-to-upload functionality.
 * Shows a preview thumbnail after upload.
 */
import { useCallback, useState } from "react";
import { UploadIcon, XIcon, VideoIcon, PlayIcon } from "../ui/Icons";

interface VideoUploadProps {
  onVideoSelect: (file: File | null) => void;
  selectedVideo: File | null;
}

export function VideoUpload({ onVideoSelect, selectedVideo }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("video/")) {
        onVideoSelect(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    },
    [onVideoSelect]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onVideoSelect(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    },
    [onVideoSelect]
  );

  const handleRemove = useCallback(() => {
    onVideoSelect(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [onVideoSelect, previewUrl]);

  // Show preview if video is selected
  if (selectedVideo && previewUrl) {
    return (
      <div className="relative group">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 border border-unfocused-border-color">
          <video
            src={previewUrl}
            className="w-full h-full object-cover"
            muted
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <PlayIcon size={20} className="text-white" />
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove video"
        >
          <XIcon size={12} />
        </button>
        <p className="text-xs text-muted mt-1 truncate max-w-16">
          {selectedVideo.name}
        </p>
      </div>
    );
  }

  // Upload zone
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-16 h-16 rounded-lg border-2 border-dashed
        flex flex-col items-center justify-center cursor-pointer
        transition-all duration-200
        ${
          isDragging
            ? "border-accent bg-accent/10"
            : "border-unfocused-border-color hover:border-focused-border-color hover:bg-foreground/5"
        }
      `}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload video"
      />
      {isDragging ? (
        <UploadIcon size={20} className="text-accent" />
      ) : (
        <VideoIcon size={20} className="text-muted" />
      )}
    </div>
  );
}
