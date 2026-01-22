"use client";

/**
 * Project page - the main workspace for a single video project.
 * This page will eventually contain the 5-screen workflow:
 * 1. Intent - Confirm the video idea
 * 2. Proofs - Collect evidence/sources
 * 3. Script - Review and approve the script
 * 4. Preview - Preview and adjust the video
 * 5. Publish - Publish to platforms
 *
 * For V0, this is a placeholder showing project status.
 */
import { useParams } from "next/navigation";
import { Header } from "../../../components/ui/Header";
import { SparklesIcon, LoaderIcon } from "../../../components/ui/Icons";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-screen-xl mx-auto px-4 pt-20 pb-8">
        {/* Project header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted mb-2">
            <span>Project</span>
            <span>/</span>
            <code className="px-2 py-0.5 bg-foreground/5 rounded text-xs font-mono">
              {projectId}
            </code>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            New Video Project
          </h1>
        </div>

        {/* Processing status */}
        <div className="bg-foreground/5 border border-unfocused-border-color rounded-2xl p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <LoaderIcon size={24} className="text-accent" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Setting up your project...
            </h2>
            <p className="text-muted max-w-md">
              We're analyzing your input and preparing the video workspace.
              This usually takes a few seconds.
            </p>
          </div>
        </div>

        {/* Workflow stages (coming soon) */}
        <div className="mt-8 grid grid-cols-5 gap-4">
          {["Intent", "Proofs", "Script", "Preview", "Publish"].map(
            (stage, index) => (
              <div
                key={stage}
                className={`
                  p-4 rounded-xl border text-center
                  ${
                    index === 0
                      ? "border-accent bg-accent/5"
                      : "border-unfocused-border-color bg-foreground/5 opacity-50"
                  }
                `}
              >
                <div className="text-2xl font-bold text-foreground/30 mb-1">
                  {index + 1}
                </div>
                <div className="text-sm font-medium text-foreground">
                  {stage}
                </div>
              </div>
            )
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <div className="flex items-start gap-3">
            <SparklesIcon size={20} className="text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground mb-1">
                V0 Implementation
              </h3>
              <p className="text-sm text-muted">
                This is the initial project page. The 5-screen workflow will be
                implemented incrementally. For now, projects are created and
                n8n webhooks are triggered.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
