import { getAccessToken } from "./shared";
import { Context } from "./types";

export async function onRequestPost(ctx: Context): Promise<Response> {
  try {
    const accessToken = await getAccessToken(ctx.env);

    return Response.json(accessToken, { status: 200 });
  } catch (e) {
    console.log("Getting access token failed. Error:", e);
    return Response.json({ message: "Getting access token failed" }, { status: 500 });
  }
}
