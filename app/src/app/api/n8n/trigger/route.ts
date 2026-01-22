/**
 * API route for triggering n8n workflows from the frontend.
 * Acts as a proxy to n8n webhooks with authentication and validation.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for workflow trigger requests
const TriggerRequestSchema = z.object({
  projectId: z.string(),
  workflow: z.enum([
    "ingest-understand", // Analyze uploaded video
    "script-writer", // Generate script from intent + proofs
    "voice-avatar", // Generate voiceover and avatar
    "render", // Trigger Remotion render
    "publish", // Publish to platforms
  ]),
  payload: z.record(z.unknown()).optional(),
});

/**
 * POST /api/n8n/trigger
 * Triggers an n8n workflow for a specific project and action.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parsed = TriggerRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { projectId, workflow, payload } = parsed.data;

    // Get n8n webhook URL
    const n8nBaseUrl = process.env.N8N_WEBHOOK_BASE_URL;
    if (!n8nBaseUrl) {
      return NextResponse.json(
        { error: "n8n webhook URL not configured" },
        { status: 500 }
      );
    }

    // Build the workflow-specific webhook path
    const webhookPaths: Record<string, string> = {
      "ingest-understand": "/ingest",
      "script-writer": "/script",
      "voice-avatar": "/voice",
      render: "/render",
      publish: "/publish",
    };

    const webhookPath = webhookPaths[workflow];
    const webhookUrl = `${n8nBaseUrl}${webhookPath}`;

    // Prepare the payload for n8n
    const n8nPayload = {
      projectId,
      timestamp: new Date().toISOString(),
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/n8n/callback`,
      ...payload,
    };

    // Call n8n webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add auth header if configured
        ...(process.env.N8N_CALLBACK_SECRET && {
          "X-Webhook-Secret": process.env.N8N_CALLBACK_SECRET,
        }),
      },
      body: JSON.stringify(n8nPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("n8n webhook failed:", errorText);
      return NextResponse.json(
        { error: "Failed to trigger workflow", details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      workflow,
      projectId,
      result,
    });
  } catch (error) {
    console.error("Failed to trigger n8n workflow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
