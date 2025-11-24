import db from "../../../lib/db/db";
import { Askcontext } from "../ask/route";
import { AppError } from "./AppError";
import type { IngestContext } from "./orchestrator";

export async function stepAuth<T extends IngestContext | Askcontext>(
  req: Request,
  ctx: T
) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) throw new AppError("Unauthorized", 401);

  const row = await db.query.tokensTable.findFirst({
    where: (tokensTable, { eq }) => eq(tokensTable.token, token),
  });
  if (!row) throw new AppError("Invalid token", 401);

  ctx.userId = row.userId;

  const c = req.headers.get("codrelai_client");
  ctx.client = c as T["client"];
}
