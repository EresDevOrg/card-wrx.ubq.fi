import { isSandbox } from "./shared";
import { Context } from "./types";

export async function onRequestGet(ctx: Context): Promise<Response> {
  return Response.json({ isSandbox: isSandbox(ctx.env) }, { status: 200 });
}
