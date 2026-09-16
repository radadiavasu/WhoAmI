import { z } from "zod";

export const neighborRelationSchema = z.enum([
  "prereq",
  "sibling",
  "next",
  "usedIn",
]);
export const nextStepKindSchema = z.enum([
  "goDeeper",
  "seeRelated",
  "prereqFirst",
]);
export const nodeLevelSchema = z.enum(["intro", "core", "frontier"]);

export const conceptNodeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  alias: z.string().optional(),
  parentId: z.string().nullable(),
  level: nodeLevelSchema,
  oneBreath: z.string().min(1),
  does: z.array(z.string()).min(1).max(2),
  doesNot: z.array(z.string()).min(1).max(2),
  neighbors: z
    .array(
      z.object({
        id: z.string(),
        relation: neighborRelationSchema,
      }),
    )
    .min(0)
    .max(4),
  nextStep: z.object({
    kind: nextStepKindSchema,
    targetId: z.string().optional(),
    label: z.string().min(1),
  }),
  analogy: z.string().optional(),
  example: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  year: z.number().int().optional(),
  relatedTechniques: z.array(z.string()).optional(),
  changing: z.string().optional(),
});

export const nodesFileSchema = z.array(conceptNodeSchema).min(1);

export type ConceptNode = z.infer<typeof conceptNodeSchema>;
export type NeighborRelation = z.infer<typeof neighborRelationSchema>;
export type NextStepKind = z.infer<typeof nextStepKindSchema>;
export type NodeLevel = z.infer<typeof nodeLevelSchema>;
