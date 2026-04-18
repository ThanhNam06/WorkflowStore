import { createHash } from "node:crypto";
import { allWorkflows } from "@/data/workflows";
import type { WorkflowSeed } from "@/data/workflows";

export type ProductView = {
  catalogId: string;
  dbId: string;
  slug: string;
  name: string;
  description: string;
  platform: "make" | "n8n";
  category: string;
  complexity: "beginner" | "intermediate" | "advanced";
  image: string;
  estimatedTime: string;
  price_usd: number;
  price_vnd: number;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function stableUuidFromText(input: string) {
  const hex = createHash("sha256").update(input).digest("hex").slice(0, 32).split("");
  hex[12] = "4";
  const variant = parseInt(hex[16], 16);
  hex[16] = ((variant & 0x3) | 0x8).toString(16);
  const h = hex.join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export const products: ProductView[] = (allWorkflows as WorkflowSeed[]).map((w) => ({
  catalogId: w.id,
  dbId: stableUuidFromText(`workflowstore:${w.id}`),
  slug: slugify(`${w.platform}-${w.id}-${w.title}`),
  name: w.title,
  description: w.description,
  platform: w.platform,
  category: w.category,
  complexity: w.complexity,
  image: w.image,
  estimatedTime: w.estimatedTime,
  price_usd: Number(w.price),
  price_vnd: Math.round(Number(w.price) * 25500),
}));

export function findProductByCatalogId(catalogId: string) {
  return products.find((p) => p.catalogId === catalogId);
}

export function findProductByDbId(dbId: string) {
  return products.find((p) => p.dbId === dbId);
}
