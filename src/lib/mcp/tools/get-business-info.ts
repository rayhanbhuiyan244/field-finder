import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_business_info",
  title: "Get business info",
  description: "Get the turf's public business info: name, address, contact, hours.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { doc, getDoc } = await import("firebase/firestore");
    const { db } = await import("@/firebase/config");
    const snap = await getDoc(doc(db, "settings", "business"));
    const info = snap.exists() ? snap.data() : null;
    return {
      content: [
        {
          type: "text",
          text: info ? JSON.stringify(info, null, 2) : "No business info configured yet.",
        },
      ],
      structuredContent: { info },
    };
  },
});
