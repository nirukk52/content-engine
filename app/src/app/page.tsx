"use client";

/**
 * Home page - the main entry point for Content Engine.
 * Features a centered chat-style interface for starting new video projects.
 * Users can either:
 * 1. Describe their video idea in text
 * 2. Attach a reference video to clone the style
 * 3. Both - provide an idea and a reference video
 */
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatInput } from "../components/chat/ChatInput";
import { Header } from "../components/ui/Header";
import { SparklesIcon, VideoIcon } from "../components/ui/Icons";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (idea: string, video: File | null) => {
      setIsLoading(true);
      setError(null);

      try {
        // Create form data for file upload
        const formData = new FormData();
        formData.append("idea", idea);
        if (video) {
          formData.append("video", video);
        }

        // Call API to create project
        const response = await fetch("/api/projects", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to create project");
        }

        const { projectId } = await response.json();

        // Navigate to the project page
        router.push(`/project/${projectId}`);
      } catch (err) {
        console.error("Failed to create project:", err);
        setError("Failed to create project. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Main content - centered vertically and horizontally */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-14">
        {/* Hero section */}
        <div className="text-center mb-12 max-w-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
            <SparklesIcon size={32} className="text-accent" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Create Short-Form Videos with AI
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            Transform your ideas into polished YouTube Shorts and Instagram Reels.
            Describe your concept or upload a reference video to get started.
          </p>
        </div>

        {/* Chat input */}
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Error message */}
        {error && (
          <p className="mt-4 text-sm text-geist-error">{error}</p>
        )}

        {/* Feature hints */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-16 text-sm text-muted">
          <div className="flex items-center gap-2">
            <VideoIcon size={16} />
            <span>30-60 second videos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-muted" />
          </div>
          <div className="flex items-center gap-2">
            <span>Varun Mayya style</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-muted" />
          </div>
          <div className="flex items-center gap-2">
            <span>Human-in-the-loop</span>
          </div>
        </div>
      </div>
    </main>
  );
}
