import { Router } from "express";
import { supabase } from "../supabase";

export const seasonsRouter = Router();

// List all seasons
seasonsRouter.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("id");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Get one season by id
seasonsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid id" });
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Season not found" });
  return res.json(data);
});

// Create season
seasonsRouter.post("/", async (req, res) => {
  const { name, fk_series } = req.body || {};
  if (!name) return res.status(422).json({ error: "name is required" });
  if (!Number.isFinite(Number(fk_series)))
    return res.status(422).json({ error: "fk_series is required" });
  const { data, error } = await supabase
    .from("seasons")
    .insert([{ name, fk_series: Number(fk_series) }])
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// Update season
seasonsRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid id" });
  const { name, fk_series } = req.body || {};
  const update: Record<string, unknown> = {};
  if (typeof name !== "undefined") update.name = name;
  if (typeof fk_series !== "undefined") update.fk_series = Number(fk_series);
  if (Object.keys(update).length === 0) {
    return res
      .status(422)
      .json({ error: "At least one field to update is required" });
  }
  const { data, error } = await supabase
    .from("seasons")
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Season not found" });
  return res.json(data);
});

// Delete season
seasonsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid id" });
  const { data, error } = await supabase
    .from("seasons")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Season not found" });
  return res.status(204).send();
});

// Hierarchical: list episodes for a season
seasonsRouter.get("/:id/episodes", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid id" });
  // Ensure parent season exists
  const parent = await supabase
    .from("seasons")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (parent.error)
    return res.status(500).json({ error: parent.error.message });
  if (!parent.data) return res.status(404).json({ error: "Season not found" });
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("fk_season", id)
    .order("id");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});
