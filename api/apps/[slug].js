import { getCatalogAppBySlug } from "../_lib/catalog-apps.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query || {};
  if (typeof slug !== "string" || !slug.trim()) {
    return res.status(400).json({ error: "App slug is required." });
  }

  const app = getCatalogAppBySlug(slug.trim().toLowerCase());
  if (!app) {
    return res.status(404).json({ error: "App not found." });
  }

  return res.status(200).json(app);
}
