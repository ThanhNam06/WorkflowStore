import { randomUUID } from "node:crypto";

export function randomOrderCode() {
  return `ORD_${randomUUID().replace(/-/g, "")}`;
}
