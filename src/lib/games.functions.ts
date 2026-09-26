import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { loadGame, loadPortal } from "./games.server";

export const getPortal = createServerFn({ method: "GET" }).handler(async () => loadPortal());

export const getGame = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(async ({ data }) => loadGame(data.slug));
