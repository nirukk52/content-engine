/**
 * Project state types for the Content Engine.
 * A project represents a single video from idea to published content.
 * State is persisted as JSON files per project.
 */
import { z } from "zod";
import { SceneSchema } from "./constants";

/**
 * Project status enum representing the 5-screen workflow.
 */
export const ProjectStatus = z.enum([
  "draft", // Initial state
  "intent", // Screen 1: Intent confirmed
  "proof", // Screen 2: Proofs collected
  "script", // Screen 3: Script approved
  "preview", // Screen 4: Preview approved
  "rendering", // Currently rendering
  "published", // Screen 5: Published to platforms
]);

export type ProjectStatusType = z.infer<typeof ProjectStatus>;

/**
 * Tone options for the Varun Mayya style content.
 */
export const ToneSchema = z.enum(["insightful", "contrarian", "calm"]);

/**
 * Target audience options.
 */
export const AudienceSchema = z.enum(["builders", "general", "india-first"]);

/**
 * Proof asset types for credibility.
 */
export const ProofTypeSchema = z.enum([
  "video",
  "screenshot",
  "tweet",
  "article",
]);

/**
 * Intent data from Screen 1 - capturing the video idea.
 */
export const IntentSchema = z.object({
  rawIdea: z.string(),
  intentStatement: z.string(),
  tone: ToneSchema,
  audience: AudienceSchema,
  targetLength: z.union([z.literal(30), z.literal(45), z.literal(60)]),
  confirmed: z.boolean(),
});

export type Intent = z.infer<typeof IntentSchema>;

/**
 * Proof asset for credibility.
 */
export const ProofSchema = z.object({
  id: z.string(),
  type: ProofTypeSchema,
  url: z.string(),
  keyLine: z.string(),
  credibilityScore: z.number().min(0).max(100),
  timestamp: z.number().optional(),
});

export type Proof = z.infer<typeof ProofSchema>;

/**
 * Beat map for script timing (frame ranges).
 */
export const BeatMapSchema = z.object({
  hook: z.tuple([z.number(), z.number()]),
  context: z.tuple([z.number(), z.number()]),
  insight: z.tuple([z.number(), z.number()]),
  implication: z.tuple([z.number(), z.number()]),
  close: z.tuple([z.number(), z.number()]),
});

/**
 * Script data from Screen 3.
 */
export const ScriptSchema = z.object({
  scenes: z.array(SceneSchema),
  beatMap: BeatMapSchema,
  scores: z.object({
    clarity: z.number().min(0).max(100),
    flow: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
  }),
});

export type Script = z.infer<typeof ScriptSchema>;

/**
 * Preview data from Screen 4.
 */
export const PreviewSchema = z.object({
  blueprintUrl: z.string(),
  sceneApprovals: z.record(z.string(), z.boolean()),
  notes: z.record(z.string(), z.string()),
});

export type Preview = z.infer<typeof PreviewSchema>;

/**
 * Output data from Screen 5.
 */
export const OutputSchema = z.object({
  videoUrl: z.string(),
  title: z.string(),
  description: z.string(),
  hashtags: z.array(z.string()),
  platformUrls: z.record(z.string(), z.string()),
  rating: z.number().min(1).max(5).optional(),
});

export type Output = z.infer<typeof OutputSchema>;

/**
 * Complete project state schema.
 * This is persisted as JSON at /projects/{projectId}/state.json
 */
export const ProjectStateSchema = z.object({
  id: z.string(),
  status: ProjectStatus,
  createdAt: z.string(),
  updatedAt: z.string(),

  // Screen 1 - Intent
  intent: IntentSchema.optional(),

  // Screen 2 - Proofs
  proofs: z.array(ProofSchema).optional(),

  // Screen 3 - Script
  script: ScriptSchema.optional(),

  // Screen 4 - Preview
  preview: PreviewSchema.optional(),

  // Screen 5 - Output
  output: OutputSchema.optional(),

  // Reference video for style analysis
  referenceVideoUrl: z.string().optional(),
});

export type ProjectState = z.infer<typeof ProjectStateSchema>;

/**
 * Create a new empty project state.
 */
export function createEmptyProject(id: string): ProjectState {
  const now = new Date().toISOString();
  return {
    id,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}
