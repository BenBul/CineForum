import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "../../_lib/supabase";
import { IdParams, CommentResponse } from "../../../../packages/api/schemas";

/**
 * Get comment by id
 * @description Fetch a single comment by id
 * @pathParams IdParams
 * @response CommentResponse
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
    .from("comments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  return NextResponse.json(data);
}

/**
 * Update comment
 * @description Partially update comment by id
 * @pathParams IdParams
 * @response CommentResponse
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
    fk_series?: number | null;
    fk_season?: number | null;
    fk_episode?: number | null;
    fk_user?: string;
    text?: string;
  };
  const update: Record<string, unknown> = {};
  if (typeof body.fk_series !== "undefined") update.fk_series = body.fk_series;
  if (typeof body.fk_season !== "undefined") update.fk_season = body.fk_season;
  if (typeof body.fk_episode !== "undefined") update.fk_episode = body.fk_episode;
  if (typeof body.fk_user !== "undefined") update.fk_user = body.fk_user;
  if (typeof body.text !== "undefined") update.text = body.text;
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "At least one field to update is required" }, { status: 422 });
  }
  const { data, error } = await supabase
    .from("comments")
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  return NextResponse.json(data);
}

/**
 * Delete comment
 * @description Delete comment by id
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
    .from("comments")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}


