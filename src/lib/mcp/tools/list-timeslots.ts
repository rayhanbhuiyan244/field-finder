import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "list_timeslots",
  title: "List time slots",
  description: "List all bookable time slots for the turf (e.g. '18:00 - 19:00').",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
    const { db } = await import("@/firebase/config");
    const snap = await getDocs(query(collection(db, "timeslots"), orderBy("order", "asc")));
    const slots = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
    return {
      content: [{ type: "text", text: JSON.stringify(slots, null, 2) }],
      structuredContent: { slots },
    };
  },
});
