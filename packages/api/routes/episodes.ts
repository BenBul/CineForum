import { Router } from "express";
import { supabase } from "../supabase";

export const episodesRouter = Router();

// List all episodes
episodesRouter.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .order("id");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Get one episode by id
episodesRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid id" });
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Episode not found" });
  return res.json(data);
});

// Create episode
episodesRouter.post("/", async (req, res) => {
  const { name, fk_season } = req.body || {};
  if (!name) return res.status(422).json({ error: "name is required" });
  if (!Number.isFinite(Number(fk_season)))
    return res.status(422).json({ error: "fk_season is required" });
  const { data, error } = await supabase
    .from("episodes")
    .insert([{ name, fk_season: Number(fk_season) }])
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// Update episode
episodesRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid id" });
  const { name, fk_season } = req.body || {};
  const update: Record<string, unknown> = {};
  if (typeof name !== "undefined") update.name = name;
  if (typeof fk_season !== "undefined") update.fk_season = Number(fk_season);
  if (Object.keys(update).length === 0) {
    return res
      .status(422)
      .json({ error: "At least one field to update is required" });
  }
  const { data, error } = await supabase
    .from("episodes")
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Episode not found" });
  return res.json(data);
});

// Delete episode
episodesRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid id" });
  const { data, error } = await supabase
    .from("episodes")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Episode not found" });
  return res.status(204).send();
});
