import { z } from "zod";

// Common primitives
export const idInt = z
  .number()
  .int("id must be an integer")
  .positive("id must be positive");

export const uuid = z.string().uuid("must be a valid UUID");

export const timestamp = z
  .string()
  .datetime({ offset: true, message: "created_at must be an ISO timestamp" });

// user
export const userSchema = z
  .object({
    id: uuid.describe("User id (auth.users.id, UUID primary key)"),
    created_at: timestamp.describe("Row creation time in UTC (ISO 8601)"),
  })
  .describe("User table as mirrored from Supabase auth.users");

// series
export const seriesSchema = z
  .object({
    id: idInt.describe("Series numeric identifier (PK)"),
    created_at: timestamp.describe("Row creation time in UTC (ISO 8601)"),
    name: z.string().describe("Series title/name"),
    image_url: z.string().describe("Public URL of the series image (nullable)"),
  })
  .describe("Series table with name and optional image URL");

// seasons
export const seasonSchema = z
  .object({
    id: idInt.describe("Season numeric identifier (PK)"),
    created_at: timestamp.describe("Row creation time in UTC (ISO 8601)"),
    fk_series: idInt.describe("Foreign key to series.id"),
    name: z.string().describe("Season name/number label"),
  })
  .describe("Seasons table belonging to a series");

// episodes
export const episodeSchema = z
  .object({
    id: idInt.describe("Episode numeric identifier (PK)"),
    created_at: timestamp.describe("Row creation time in UTC (ISO 8601)"),
    fk_season: idInt.describe("Foreign key to seasons.id"),
    name: z.string().describe("Episode name/title"),
  })
  .describe("Episodes table belonging to a specific season");

// comments
export const commentSchema = z
  .object({
    id: idInt.describe("Comment numeric identifier (PK)"),
    created_at: timestamp.describe("Row creation time in UTC (ISO 8601)"),
    fk_series: idInt.nullable().optional().describe("Optional FK to series.id"),
    fk_season: idInt
      .nullable()
      .optional()
      .describe("Optional FK to seasons.id"),
    fk_episode: idInt
      .nullable()
      .optional()
      .describe("Optional FK to episodes.id"),
    fk_user: uuid.describe("FK to user.id (auth.users.id)"),
    text: z.string().optional().describe("Optional comment text body"),
  })
  .describe(
    "Comments table referencing optional series/season/episode and author user"
  );

// Input schemas (for API payload validation)
export const seriesCreateInput = seriesSchema
  .pick({ name: true, image_url: true })
  .partial({ image_url: true })
  .describe("Payload to create a series");
export const seriesUpdateInput = seriesSchema
  .pick({ name: true, image_url: true })
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field to update is required",
  })
  .describe("Payload to update a series");

export const seasonCreateInput = seasonSchema
  .pick({ name: true, fk_series: true })
  .describe("Payload to create a season");
export const seasonUpdateInput = seasonSchema
  .pick({ name: true, fk_series: true })
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field to update is required",
  })
  .describe("Payload to update a season");

export const episodeCreateInput = episodeSchema
  .pick({ name: true, fk_season: true })
  .describe("Payload to create an episode");
export const episodeUpdateInput = episodeSchema
  .pick({ name: true, fk_season: true })
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field to update is required",
  })
  .describe("Payload to update an episode");

export const commentCreateInput = commentSchema
  .pick({
    fk_series: true,
    fk_season: true,
    fk_episode: true,
    fk_user: true,
    text: true,
  })
  .describe("Payload to create a comment");
export const commentUpdateInput = commentSchema
  .pick({
    fk_series: true,
    fk_season: true,
    fk_episode: true,
    fk_user: true,
    text: true,
  })
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field to update is required",
  })
  .describe("Payload to update a comment");
