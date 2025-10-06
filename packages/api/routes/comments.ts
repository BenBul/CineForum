import { Router } from "express";
import { supabase } from "../supabase";

export const commentsRouter = Router();

// List all comments or filter by series/season/episode/user via query
commentsRouter.get("/", async (req, res) => {
  let query = supabase.from("comments").select("*");
  const { fk_series, fk_season, fk_episode, fk_user } = req.query;
  if (fk_series) query = query.eq("fk_series", Number(fk_series));
  if (fk_season) query = query.eq("fk_season", Number(fk_season));
  if (fk_episode) query = query.eq("fk_episode", Number(fk_episode));
  if (fk_user) query = query.eq("fk_user", String(fk_user));
  const { data, error } = await query.order("id");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Get one comment by id
commentsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid id" });
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Comment not found" });
  return res.json(data);
});

// Create comment
commentsRouter.post("/", async (req, res) => {
  const { fk_series, fk_season, fk_episode, fk_user, text } = req.body || {};
  if (!fk_user) return res.status(422).json({ error: "fk_user is required" });
  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        fk_series: fk_series ?? null,
        fk_season: fk_season ?? null,
        fk_episode: fk_episode ?? null,
        fk_user,
        text,
      },
    ])
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// Update comment
commentsRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid id" });
  const { fk_series, fk_season, fk_episode, fk_user, text } = req.body || {};
  const update: Record<string, unknown> = {};
  if (typeof fk_series !== "undefined") update.fk_series = fk_series;
  if (typeof fk_season !== "undefined") update.fk_season = fk_season;
  if (typeof fk_episode !== "undefined") update.fk_episode = fk_episode;
  if (typeof fk_user !== "undefined") update.fk_user = fk_user;
  if (typeof text !== "undefined") update.text = text;
  if (Object.keys(update).length === 0) {
    return res
      .status(422)
      .json({ error: "At least one field to update is required" });
  }
  const { data, error } = await supabase
    .from("comments")
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Comment not found" });
  return res.json(data);
});

// Delete comment
commentsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid id" });
  const { data, error } = await supabase
    .from("comments")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Comment not found" });
  return res.status(204).send();
});
