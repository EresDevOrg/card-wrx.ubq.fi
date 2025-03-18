import { getAccessToken } from "./shared";

export async function onRequest(ctx): Promise<Response> {
  try {
    const accessToken = await getAccessToken(ctx.env);

    return Response.json(accessToken, { status: 200 });
  } catch (e) {
    console.log("Getting access token failed. Error:", e);
    return Response.json({ message: "Getting access token failed" }, { status: 500 });
  }
}
