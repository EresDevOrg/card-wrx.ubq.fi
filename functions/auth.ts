export async function onRequest(): Promise<Response> {
  return Response.json({ message: "test" }, { status: 200 });
}
