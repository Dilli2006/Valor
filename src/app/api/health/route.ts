import { getModels } from "@/lib/ai/provider";

export async function GET() {
  const models = getModels();
  return Response.json({ ok: true, aiConfigured: models.length > 0, models: models.map((m) => m.id) });
}
