import { Router } from "express";
import { supabase } from "../supabase";

export const seriesRouter = Router();

// List all series
seriesRouter.get("/", async (_req, res) => {
  const { data, error } = await supabase.from("series").select("*").order("id");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Get one series by id
seriesRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid id" });
  const { data, error } = await supabase
    .from("series")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Series not found" });
  return res.json(data);
});

// Create series
seriesRouter.post("/", async (req, res) => {
  const { name, image_url } = req.body || {};
  if (!name) return res.status(422).json({ error: "name is required" });
  const { data, error } = await supabase
    .from("series")
    .insert([{ name, image_url: image_url || null }])
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// Update series
seriesRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid id" });
  const { name, image_url } = req.body || {};
  if (typeof name === "undefined" && typeof image_url === "undefined") {
    return res
      .status(422)
      .json({ error: "At least one field to update is required" });
  }
  const update: Record<string, unknown> = {};
  if (typeof name !== "undefined") update.name = name;
  if (typeof image_url !== "undefined") update.image_url = image_url;
  const { data, error } = await supabase
    .from("series")
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Series not found" });
  return res.json(data);
});

// Delete series
seriesRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid id" });
  const { data, error } = await supabase
    .from("series")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Series not found" });
  return res.status(204).send();
});

// Hierarchical: list seasons for a series
seriesRouter.get("/:id/seasons", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid id" });
  const parent = await supabase
    .from("series")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (parent.error)
    return res.status(500).json({ error: parent.error.message });
  if (!parent.data) return res.status(404).json({ error: "Series not found" });
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("fk_series", id)
    .order("id");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});
