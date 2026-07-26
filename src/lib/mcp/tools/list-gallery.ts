import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "list_gallery",
  title: "List gallery images",
  description: "List public gallery photos of the turf.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
    const { db } = await import("@/firebase/config");
    const snap = await getDocs(query(collection(db, "gallery"), orderBy("order", "asc")));
    const images = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
    return {
      content: [{ type: "text", text: JSON.stringify(images, null, 2) }],
      structuredContent: { images },
    };
  },
});