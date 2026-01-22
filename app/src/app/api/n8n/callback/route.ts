/**
 * API route for receiving callbacks from n8n workflows.
 * n8n workflows call this endpoint when they complete a stage.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for callback requests from n8n
const CallbackRequestSchema = z.object({
  projectId: z.string(),
  stage: z.enum([
    "ingest-complete", // Video analysis complete
    "script-complete", // Script generation complete
    "voice-complete", // Voiceover generation complete
    "avatar-complete", // Avatar generation complete
    "render-complete", // Video rendering complete
    "publish-complete", // Publishing complete
    "error", // Error occurred
  ]),
  result: z.record(z.unknown()),
});

// Verify the webhook secret for security
function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = process.env.N8N_CALLBACK_SECRET;
  if (!secret) {
    // If no secret configured, allow in development
    return process.env.NODE_ENV === "development";
  }

  const providedSecret = request.headers.get("X-Webhook-Secret");
  return providedSecret === secret;
}

/**
 * POST /api/n8n/callback
 * Receives completion callbacks from n8n workflows.
 */
export async function POST(request: NextRequest) {
  // Verify webhook authenticity
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate request body
    const parsed = CallbackRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid callback payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { projectId, stage, result } = parsed.data;

    console.log(`[n8n callback] Project ${projectId} - Stage: ${stage}`);

    // Handle different callback stages
    switch (stage) {
      case "ingest-complete":
        // Video analysis complete - update project with transcript, scenes, etc.
        await handleIngestComplete(projectId, result);
        break;

      case "script-complete":
        // Script generation complete - update project with script data
        await handleScriptComplete(projectId, result);
        break;

      case "voice-complete":
        // Voiceover complete - update project with audio URL
        await handleVoiceComplete(projectId, result);
        break;

      case "avatar-complete":
        // Avatar video complete - update project with avatar URL
        await handleAvatarComplete(projectId, result);
        break;

      case "render-complete":
        // Video rendering complete - update project with video URL
        await handleRenderComplete(projectId, result);
        break;

      case "publish-complete":
        // Publishing complete - update project with platform URLs
        await handlePublishComplete(projectId, result);
        break;

      case "error":
        // Handle workflow error
        await handleWorkflowError(projectId, result);
        break;

      default:
        console.warn(`Unknown callback stage: ${stage}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to process n8n callback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handler functions for each stage
// TODO: Implement these handlers to update project state

async function handleIngestComplete(
  projectId: string,
  result: Record<string, unknown>
) {
  console.log(`[ingest-complete] Project ${projectId}:`, result);
  // Update project with:
  // - transcript
  // - detected scenes
  // - key moments
  // - OCR results
}

async function handleScriptComplete(
  projectId: string,
  result: Record<string, unknown>
) {
  console.log(`[script-complete] Project ${projectId}:`, result);
  // Update project with:
  // - scenes array
  // - beat map
  // - quality scores
}

async function handleVoiceComplete(
  projectId: string,
  result: Record<string, unknown>
) {
  console.log(`[voice-complete] Project ${projectId}:`, result);
  // Update project with:
  // - voiceover audio URL
  // - duration
}

async function handleAvatarComplete(
  projectId: string,
  result: Record<string, unknown>
) {
  console.log(`[avatar-complete] Project ${projectId}:`, result);
  // Update project with:
  // - avatar video URL
}

async function handleRenderComplete(
  projectId: string,
  result: Record<string, unknown>
) {
  console.log(`[render-complete] Project ${projectId}:`, result);
  // Update project with:
  // - final video URL
  // - video metadata
}

async function handlePublishComplete(
  projectId: string,
  result: Record<string, unknown>
) {
  console.log(`[publish-complete] Project ${projectId}:`, result);
  // Update project with:
  // - platform URLs (YouTube, Instagram, TikTok, etc.)
}

async function handleWorkflowError(
  projectId: string,
  result: Record<string, unknown>
) {
  console.error(`[workflow-error] Project ${projectId}:`, result);
  // Log error and update project status
}
