import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "../../_lib/supabase";
import { IdParams, EpisodeResponse } from "../../../schemas";
import { getAuthContext, requirePermission } from "../../_lib/auth";

/**
 * Get episode by id
 * @description Fetch a single episode by id
 * @pathParams IdParams
 * @response EpisodeResponse
 * @openapi
 */
export async function GET(_request: NextRequest, context: any) {
  // Anyone can view episodes (guests, users, admins)
  const { id } = await context.params;
  const supabase = getSupabase();
  const idNum = Number(id);
  if (!Number.isFinite(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", idNum)
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  return NextResponse.json(data);
}

/**
 * Update episode
 * @description Partially update episode by id (requires ownership or admin role)
 * @pathParams IdParams
 * @response EpisodeResponse
 * @openapi
 */
export async function PUT(request: NextRequest, context: any) {
  const authContext = await getAuthContext(request);
  const { id } = await context.params;
  const supabase = getSupabase();
  const idNum = Number(id);
  if (!Number.isFinite(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  // First, fetch the episode to check ownership
  const { data: existingEpisode, error: fetchError } = await supabase
    .from("episodes")
    .select("created_by")
    .eq("id", idNum)
    .maybeSingle();

  if (fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!existingEpisode)
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });

  // Check if user has permission to update (owner or admin)
  const permissionError = requirePermission(
    authContext,
    "update",
    existingEpisode.created_by
  );
  if (permissionError) return permissionError;

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
    .eq("id", idNum)
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
 * @description Delete episode by id (requires ownership or admin role)
 * @pathParams IdParams
 * @openapi
 */
export async function DELETE(request: NextRequest, context: any) {
  const authContext = await getAuthContext(request);
  const { id } = await context.params;
  const supabase = getSupabase();
  const idNum = Number(id);
  if (!Number.isFinite(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  // First, fetch the episode to check ownership
  const { data: existingEpisode, error: fetchError } = await supabase
    .from("episodes")
    .select("created_by")
    .eq("id", idNum)
    .maybeSingle();

  if (fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!existingEpisode)
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });

  // Check if user has permission to delete (owner or admin)
  const permissionError = requirePermission(
    authContext,
    "delete",
    existingEpisode.created_by
  );
  if (permissionError) return permissionError;

  const { data, error } = await supabase
    .from("episodes")
    .delete()
    .eq("id", idNum)
    .select("id")
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
