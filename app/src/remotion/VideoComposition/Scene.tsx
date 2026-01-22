/**
 * Scene component - renders a single scene within the video composition.
 * Each scene shows:
 * - Background visual (gradient or image)
 * - Voiceover text with word highlighting
 * - Emphasis words with kinetic typography
 */
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import type { Scene } from "../../../types/constants";

interface SceneComponentProps {
  scene: Scene;
  sceneIndex: number;
  totalScenes: number;
}

/**
 * Renders a single scene with animated text and background.
 */
export const SceneComponent = ({
  scene,
  sceneIndex,
  totalScenes,
}: SceneComponentProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation timing
  const fadeInDuration = fps * 0.5; // 0.5 seconds
  const fadeOutStart = fps * 4; // Start fading at 4 seconds
  const fadeOutDuration = fps * 1; // 1 second fade out

  // Fade in/out opacity
  const opacity = interpolate(
    frame,
    [0, fadeInDuration, fadeOutStart, fadeOutStart + fadeOutDuration],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Slide up animation for text
  const slideUp = interpolate(frame, [0, fadeInDuration], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Scale animation for emphasis
  const scaleSpring = spring({
    fps,
    frame: frame - fadeInDuration / 2,
    config: {
      damping: 12,
      stiffness: 200,
    },
  });

  // Split voiceover into words for highlighting
  const words = scene.voiceover.split(" ");

  // Background gradient based on scene type
  const getBackgroundGradient = () => {
    const gradients: Record<string, string> = {
      hook: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      context: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #2d2d44 100%)",
      insight: "linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #4a2c7a 100%)",
      implication:
        "linear-gradient(135deg, #0a1a2e 0%, #1b3d4e 50%, #2c5a7a 100%)",
      close: "linear-gradient(135deg, #1a2e0a 0%, #2d4e1b 50%, #4a7a2c 100%)",
    };
    return gradients[scene.scene_id] || gradients.hook;
  };

  return (
    <AbsoluteFill
      style={{
        background: getBackgroundGradient(),
        opacity,
      }}
    >
      {/* Scene number indicator */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 40,
          color: "rgba(255,255,255,0.3)",
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: 2,
        }}
      >
        {sceneIndex + 1}/{totalScenes}
      </div>

      {/* Main content area */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
        }}
      >
        {/* Voiceover text with word highlighting */}
        <div
          style={{
            transform: `translateY(${slideUp}px)`,
            textAlign: "center",
            maxWidth: "90%",
          }}
        >
          <p
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.4,
              margin: 0,
              textShadow: "0 4px 30px rgba(0,0,0,0.5)",
            }}
          >
            {words.map((word, wordIndex) => {
              const isEmphasis = scene.emphasis_words.some(
                (ew) => word.toLowerCase().includes(ew.toLowerCase())
              );

              // Stagger animation for each word
              const wordDelay = wordIndex * 2; // 2 frames between each word
              const wordOpacity = interpolate(
                frame,
                [wordDelay, wordDelay + fadeInDuration / 2],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );

              return (
                <span
                  key={wordIndex}
                  style={{
                    display: "inline",
                    opacity: wordOpacity,
                    color: isEmphasis ? "#60a5fa" : "#ffffff",
                    fontWeight: isEmphasis ? 900 : 700,
                    transform: isEmphasis ? `scale(${scaleSpring})` : "none",
                  }}
                >
                  {word}{" "}
                </span>
              );
            })}
          </p>
        </div>
      </AbsoluteFill>

      {/* On-screen description (smaller, at bottom) */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 40,
          right: 40,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.5)",
            fontWeight: 400,
            margin: 0,
          }}
        >
          {scene.on_screen}
        </p>
      </div>
    </AbsoluteFill>
  );
};
