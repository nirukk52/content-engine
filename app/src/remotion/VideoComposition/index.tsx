/**
 * VideoComposition - Main Remotion composition for Content Engine videos.
 * Renders scenes with voiceover, captions, and visual elements in Varun Mayya style.
 *
 * This composition:
 * - Displays scenes sequentially (5 seconds each)
 * - Shows voiceover text with word highlighting
 * - Supports avatar overlay (PIP)
 * - Applies kinetic typography for emphasis words
 */
import { z } from "zod";
import { AbsoluteFill, Sequence, Audio } from "remotion";
import { CompositionProps, FRAMES_PER_SCENE } from "../../../types/constants";
import { loadFont, fontFamily } from "@remotion/google-fonts/Inter";
import { SceneComponent } from "./Scene";

// Load Inter font for captions
loadFont("normal", {
  subsets: ["latin"],
  weights: ["400", "700", "900"],
});

/**
 * Main video composition component.
 * Orchestrates the rendering of all scenes in sequence.
 */
export const VideoComposition = ({
  scenes,
  audioUrl,
}: z.infer<typeof CompositionProps>) => {

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        fontFamily,
      }}
    >
      {/* Render each scene as a sequence */}
      {scenes.map((scene, index) => (
        <Sequence
          key={scene.scene_id}
          from={index * FRAMES_PER_SCENE}
          durationInFrames={FRAMES_PER_SCENE}
        >
          <SceneComponent
            scene={scene}
            sceneIndex={index}
            totalScenes={scenes.length}
          />
        </Sequence>
      ))}

      {/* Audio track if provided */}
      {audioUrl && <Audio src={audioUrl} />}
    </AbsoluteFill>
  );
};
