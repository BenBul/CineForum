import express from "express";
import { seriesRouter } from "./routes/series";
import { seasonsRouter } from "./routes/seasons";
import { episodesRouter } from "./routes/episodes";
import { commentsRouter } from "./routes/comments";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/series", seriesRouter);
app.use("/seasons", seasonsRouter);
app.use("/episodes", episodesRouter);
app.use("/comments", commentsRouter);

// Fallback 404 for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const env: Record<string, unknown> =
  (globalThis as unknown as { process?: { env?: Record<string, unknown> } })
    ?.process?.env || {};
const port = Number(env.PORT || 3000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

export default app;
