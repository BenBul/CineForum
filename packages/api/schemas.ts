import { z } from "zod";

export const idInt = z.number().int().positive();
export const uuid = z.string().uuid();
export const timestamp = z.string().datetime({ offset: true });

export const userSchema = z.object({
  id: uuid.describe("User id (auth.users.id, UUID primary key)"),
  created_at: timestamp.describe("Row creation time in UTC (ISO 8601)"),
});

export const seriesSchema = z
  .object({
    id: idInt.describe("Series numeric identifier (PK)"),
    created_at: timestamp.describe("Row creation time in UTC (ISO 8601)"),
    name: z.string().describe("Series title/name"),
    image_url: z.string().describe("Public URL of the series image (nullable)"),
  })
  .describe("Series table with name and optional image URL");

export const seasonSchema = z
  .object({
    id: idInt.describe("Season numeric identifier (PK)"),
    created_at: timestamp.describe("Row creation time in UTC (ISO 8601)"),
    fk_series: idInt.describe("Foreign key to series.id"),
    name: z.string().describe("Season name/number label"),
  })
  .describe("Seasons table belonging to a series");

export const episodeSchema = z
  .object({
    id: idInt.describe("Episode numeric identifier (PK)"),
    created_at: timestamp.describe("Row creation time in UTC (ISO 8601)"),
    fk_season: idInt.describe("Foreign key to seasons.id"),
    name: z.string().describe("Episode name/title"),
  })
  .describe("Episodes table belonging to a specific season");

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

export const seriesCreateInput = seriesSchema
  .pick({ name: true, image_url: true })
  .partial({ image_url: true });
export const seriesUpdateInput = seriesSchema
  .pick({ name: true, image_url: true })
  .partial();

export const seasonCreateInput = seasonSchema.pick({
  name: true,
  fk_series: true,
});
export const seasonUpdateInput = seasonSchema
  .pick({ name: true, fk_series: true })
  .partial();

export const episodeCreateInput = episodeSchema.pick({
  name: true,
  fk_season: true,
});
export const episodeUpdateInput = episodeSchema
  .pick({ name: true, fk_season: true })
  .partial();

export const commentCreateInput = commentSchema.pick({
  fk_series: true,
  fk_season: true,
  fk_episode: true,
  fk_user: true,
  text: true,
});
export const commentUpdateInput = commentCreateInput.partial();

export const IdParams = z.object({ id: z.coerce.number().int().positive() });

export const SeriesListResponse = z.array(seriesSchema);
export const SeriesResponse = seriesSchema;
export const SeasonListResponse = z.array(seasonSchema);
export const SeasonResponse = seasonSchema;
export const EpisodeListResponse = z.array(episodeSchema);
export const EpisodeResponse = episodeSchema;
export const CommentListResponse = z.array(commentSchema);
export const CommentResponse = commentSchema;
