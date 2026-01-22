/**
 * Legacy types for the original Remotion template demo.
 * Kept for reference - the actual Content Engine uses types from constants.ts and project.ts
 */
import { z } from "zod";

// Legacy composition props for the demo
export const LegacyCompositionProps = z.object({
  title: z.string(),
});

export const defaultLegacyProps: z.infer<typeof LegacyCompositionProps> = {
  title: "Next.js and Remotion",
};

export const LEGACY_COMP_NAME = "DemoComp";
export const LEGACY_DURATION_IN_FRAMES = 200;
export const LEGACY_VIDEO_WIDTH = 1280;
export const LEGACY_VIDEO_HEIGHT = 720;
export const LEGACY_VIDEO_FPS = 30;
