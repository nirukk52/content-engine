/**
 * Remotion Root - registers all video compositions.
 * This file defines what compositions are available for rendering.
 */
import { Composition } from "remotion";

// Content Engine compositions
import { VideoComposition } from "./VideoComposition";
import {
  COMP_NAME,
  defaultMyCompProps,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
  FRAMES_PER_SCENE,
} from "../../types/constants";

// Legacy demo compositions (kept for reference)
import { Main } from "./MyComp/Main";
import { NextLogo } from "./MyComp/NextLogo";
import {
  LEGACY_COMP_NAME,
  defaultLegacyProps,
  LEGACY_DURATION_IN_FRAMES,
  LEGACY_VIDEO_FPS,
  LEGACY_VIDEO_HEIGHT,
  LEGACY_VIDEO_WIDTH,
} from "../../types/legacy";

export const RemotionRoot: React.FC = () => {
  // Calculate duration based on number of scenes (5 scenes * 5 seconds each = 25 seconds)
  const sceneDuration = defaultMyCompProps.scenes.length * FRAMES_PER_SCENE;

  return (
    <>
      {/* Main Content Engine composition - vertical short-form video */}
      <Composition
        id={COMP_NAME}
        component={VideoComposition}
        durationInFrames={sceneDuration}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultMyCompProps}
      />

      {/* Legacy demo composition - kept for reference */}
      <Composition
        id={LEGACY_COMP_NAME}
        component={Main}
        durationInFrames={LEGACY_DURATION_IN_FRAMES}
        fps={LEGACY_VIDEO_FPS}
        width={LEGACY_VIDEO_WIDTH}
        height={LEGACY_VIDEO_HEIGHT}
        defaultProps={defaultLegacyProps}
      />

      {/* Next.js logo animation - kept for reference */}
      <Composition
        id="NextLogo"
        component={NextLogo}
        durationInFrames={300}
        fps={30}
        width={140}
        height={140}
        defaultProps={{
          outProgress: 0,
        }}
      />
    </>
  );
};
