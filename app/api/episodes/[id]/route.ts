import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "../../_lib/supabase";
import { IdParams, EpisodeResponse } from "../../../schemas";

/**
 * Get episode by id
 * @description Fetch a single episode by id
 * @pathParams IdParams
 * @response EpisodeResponse
 * @openapi
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const id = Number(params.id);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  return NextResponse.json(data);
}

/**
 * Update episode
 * @description Partially update episode by id
 * @pathParams IdParams
 * @response EpisodeResponse
 * @openapi
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const id = Number(params.id);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    fk_season?: number;
  };
  const update: Record<string, unknown> = {};
  if (typeof body.name !== "undefined") update.name = body.name;
  if (typeof body.fk_season !== "undefined")
    update.fk_season = Number(body.fk_season);
  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "At least one field to update is required" },
      { status: 422 }
    );
  }
  const { data, error } = await supabase
    .from("episodes")
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  return NextResponse.json(data);
}

/**
 * Delete episode
 * @description Delete episode by id
 * @pathParams IdParams
 * @openapi
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const id = Number(params.id);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const { data, error } = await supabase
    .from("episodes")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
