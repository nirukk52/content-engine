"use client";

/**
 * ChatInput component - the main input area for creating new video projects.
 * Features:
 * - Center-aligned like ChatGPT/Claude
 * - Video attachment support
 * - Text input for video idea/prompt
 * - Submit button that triggers n8n workflow
 */
import { useState, useCallback, FormEvent } from "react";
import { VideoUpload } from "./VideoUpload";
import { SendIcon, SparklesIcon, LoaderIcon } from "../ui/Icons";

interface ChatInputProps {
  onSubmit: (idea: string, video: File | null) => Promise<void>;
  isLoading?: boolean;
}

export function ChatInput({ onSubmit, isLoading = false }: ChatInputProps) {
  const [idea, setIdea] = useState("");
  const [video, setVideo] = useState<File | null>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!idea.trim() && !video) return;
      await onSubmit(idea, video);
      setIdea("");
      setVideo(null);
    },
    [idea, video, onSubmit]
  );

  const canSubmit = (idea.trim().length > 0 || video !== null) && !isLoading;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative bg-background border border-unfocused-border-color rounded-2xl shadow-lg focus-within:border-focused-border-color focus-within:shadow-xl transition-all duration-200">
        {/* Video attachment area */}
        {video && (
          <div className="px-4 pt-4">
            <VideoUpload onVideoSelect={setVideo} selectedVideo={video} />
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-3 p-4">
          {/* Video upload button (when no video) */}
          {!video && (
            <VideoUpload onVideoSelect={setVideo} selectedVideo={video} />
          )}

          {/* Text input */}
          <div className="flex-1 min-w-0">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your video idea... or attach a reference video"
              className="w-full resize-none bg-transparent border-0 outline-none text-foreground placeholder:text-muted text-base leading-relaxed max-h-32"
              rows={1}
              disabled={isLoading}
              onInput={(e) => {
                // Auto-resize textarea
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
              onKeyDown={(e) => {
                // Submit on Enter (without Shift)
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSubmit) {
                    handleSubmit(e);
                  }
                }
              }}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`
              flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
              transition-all duration-200
              ${
                canSubmit
                  ? "bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
                  : "bg-button-disabled-color text-disabled-text-color cursor-not-allowed"
              }
            `}
            aria-label="Create video"
          >
            {isLoading ? (
              <LoaderIcon size={18} />
            ) : (
              <SendIcon size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Hint text */}
      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted">
        <SparklesIcon size={14} />
        <span>Attach a reference video or describe your idea</span>
      </div>
    </form>
  );
}
