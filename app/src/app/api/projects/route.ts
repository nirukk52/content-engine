/**
 * API route for project management.
 * POST: Create a new project
 * GET: List all projects (future)
 */
import { NextRequest, NextResponse } from "next/server";
import { createEmptyProject } from "../../../../types/project";
import { put } from "@vercel/blob";

// Generate a unique project ID
function generateProjectId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `proj_${timestamp}_${random}`;
}

/**
 * POST /api/projects
 * Creates a new video project from an idea and/or reference video.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const idea = formData.get("idea") as string | null;
    const video = formData.get("video") as File | null;

    // Validate input - need at least one of idea or video
    if (!idea?.trim() && !video) {
      return NextResponse.json(
        { error: "Please provide a video idea or attach a reference video" },
        { status: 400 }
      );
    }

    // Generate project ID
    const projectId = generateProjectId();

    // Create empty project state
    const project = createEmptyProject(projectId);

    // If idea provided, set up initial intent
    if (idea?.trim()) {
      project.intent = {
        rawIdea: idea.trim(),
        intentStatement: "", // Will be refined by AI
        tone: "insightful", // Default tone
        audience: "builders", // Default audience
        targetLength: 45, // Default 45 seconds
        confirmed: false,
      };
    }

    // If video provided, upload to blob storage
    if (video) {
      try {
        const blobResult = await put(
          `projects/${projectId}/reference.${video.name.split(".").pop()}`,
          video,
          {
            access: "public",
            contentType: video.type,
          }
        );
        project.referenceVideoUrl = blobResult.url;
      } catch (uploadError) {
        console.error("Failed to upload video:", uploadError);
        // Continue without video if upload fails in development
        // In production, you might want to fail the request
      }
    }

    // For V0, store project state in memory or as a simple JSON
    // In production, this would go to a database or file storage
    // For now, we'll just return the project and let the client handle navigation

    // TODO: Trigger n8n workflow if video was uploaded for analysis
    if (project.referenceVideoUrl) {
      try {
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_BASE_URL;
        if (n8nWebhookUrl) {
          // Trigger the ingest-understand workflow
          await fetch(`${n8nWebhookUrl}/ingest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: project.id,
              videoUrl: project.referenceVideoUrl,
              action: "analyze",
            }),
          });
        }
      } catch (webhookError) {
        console.error("Failed to trigger n8n webhook:", webhookError);
        // Don't fail the request if webhook fails
      }
    }

    return NextResponse.json({
      projectId: project.id,
      project,
    });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/projects
 * Lists all projects (pagination support for future).
 */
export async function GET() {
  // TODO: Implement project listing from database/storage
  return NextResponse.json({
    projects: [],
    message: "Project listing not yet implemented",
  });
}
