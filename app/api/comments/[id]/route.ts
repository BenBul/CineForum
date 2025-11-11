import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "../../_lib/supabase";
import { IdParams, CommentResponse } from "../../../../packages/api/schemas";
import { getAuthContext, requirePermission } from "../../_lib/auth";

/**
 * Get comment by id
 * @description Fetch a single comment by id
 * @pathParams IdParams
 * @response CommentResponse
 * @openapi
 */
export async function GET(_request: NextRequest, context: any) {
  // Anyone can view comments (guests, users, admins)
  const { id } = await context.params;
  const supabase = getSupabase();
  const idNum = Number(id);
  if (!Number.isFinite(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("id", idNum)
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  return NextResponse.json(data);
}

/**
 * Update comment
 * @description Partially update comment by id (requires ownership or admin role)
 * @pathParams IdParams
 * @response CommentResponse
 * @openapi
 */
export async function PUT(request: NextRequest, context: any) {
  const authContext = await getAuthContext(request);
  const { id } = await context.params;
  const supabase = getSupabase();
  const idNum = Number(id);
  if (!Number.isFinite(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  // First, fetch the comment to check ownership
  const { data: existingComment, error: fetchError } = await supabase
    .from("comments")
    .select("fk_user")
    .eq("id", idNum)
    .maybeSingle();

  if (fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!existingComment)
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  // Check if user has permission to update (owner or admin)
  const permissionError = requirePermission(
    authContext,
    "update",
    existingComment.fk_user
  );
  if (permissionError) return permissionError;

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
  if (typeof body.fk_episode !== "undefined")
    update.fk_episode = body.fk_episode;
  if (typeof body.fk_user !== "undefined") update.fk_user = body.fk_user;
  if (typeof body.text !== "undefined") update.text = body.text;
  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "At least one field to update is required" },
      { status: 422 }
    );
  }
  const { data, error } = await supabase
    .from("comments")
    .update(update)
    .eq("id", idNum)
    .select("*")
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  return NextResponse.json(data);
}

/**
 * Delete comment
 * @description Delete comment by id (requires ownership or admin role)
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

  // First, fetch the comment to check ownership
  const { data: existingComment, error: fetchError } = await supabase
    .from("comments")
    .select("fk_user")
    .eq("id", idNum)
    .maybeSingle();

  if (fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!existingComment)
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  // Check if user has permission to delete (owner or admin)
  const permissionError = requirePermission(
    authContext,
    "delete",
    existingComment.fk_user
  );
  if (permissionError) return permissionError;

  const { data, error } = await supabase
    .from("comments")
    .delete()
    .eq("id", idNum)
    .select("id")
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
