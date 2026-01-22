/**
 * Video composition constants for short-form vertical content (YouTube Shorts/Reels).
 * These define the canvas dimensions and timing for all generated videos.
 */
import { z } from "zod";

// Composition names
export const COMP_NAME = "VideoComposition";

// Video dimensions - 9:16 vertical format for Shorts/Reels
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 30;

// Default duration in frames (30 seconds at 30fps)
export const DURATION_IN_FRAMES = 30 * VIDEO_FPS;

// Scene timing (in seconds)
export const SCENE_DURATION_SECONDS = 5;
export const FRAMES_PER_SCENE = SCENE_DURATION_SECONDS * VIDEO_FPS;

/**
 * Schema for a single scene in the video.
 * Each scene represents ~4-5 seconds of content following the Varun Mayya style.
 */
export const SceneSchema = z.object({
  scene_id: z.string(),
  voiceover: z.string(),
  on_screen: z.string().describe("What's visually shown"),
  proof_asset_id: z.string().optional().describe("Reference to proof material"),
  emphasis_words: z.array(z.string()).describe("Words for kinetic typography"),
});

export type Scene = z.infer<typeof SceneSchema>;

/**
 * Schema for video composition props.
 * These props are passed to the Remotion composition for rendering.
 */
export const CompositionProps = z.object({
  scenes: z.array(SceneSchema),
  audioUrl: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type CompositionPropsType = z.infer<typeof CompositionProps>;

/**
 * Default props for preview/development.
 */
export const defaultMyCompProps: CompositionPropsType = {
  scenes: [
    {
      scene_id: "hook",
      voiceover: "Here's what just happened and why it matters to you.",
      on_screen: "Hook visual with bold text",
      emphasis_words: ["happened", "matters"],
    },
    {
      scene_id: "context",
      voiceover: "The context you need to understand this.",
      on_screen: "Context explanation",
      emphasis_words: ["context", "understand"],
    },
    {
      scene_id: "insight",
      voiceover: "The key insight that changes everything.",
      on_screen: "Main insight visual",
      emphasis_words: ["insight", "changes"],
    },
    {
      scene_id: "implication",
      voiceover: "What this means for you going forward.",
      on_screen: "Implication breakdown",
      emphasis_words: ["means", "forward"],
    },
    {
      scene_id: "close",
      voiceover: "Follow for more insights like this.",
      on_screen: "Call to action",
      emphasis_words: ["Follow", "insights"],
    },
  ],
};
