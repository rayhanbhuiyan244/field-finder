import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "list_pricing",
  title: "List pricing rules",
  description:
    "List the turf's public pricing rules (weekday, weekend, peak, night, etc.) with price per slot.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
    const { db } = await import("@/firebase/config");
    const snap = await getDocs(query(collection(db, "pricing"), orderBy("order", "asc")));
    const rules = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
    return {
      content: [{ type: "text", text: JSON.stringify(rules, null, 2) }],
      structuredContent: { rules },
    };
  },
});
