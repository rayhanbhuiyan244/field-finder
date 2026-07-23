import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "check_availability",
  title: "Check availability for a date",
  description:
    "Given a date (YYYY-MM-DD), returns which time slots are booked and which are still available at the turf.",
  inputSchema: {
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe("Date in YYYY-MM-DD format."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ date }) => {
    const { collection, getDocs, orderBy, query, where } = await import("firebase/firestore");
    const { db } = await import("@/firebase/config");

    const slotsSnap = await getDocs(query(collection(db, "timeslots"), orderBy("order", "asc")));
    const slots = slotsSnap.docs.map((d) => (d.data() as { label: string }).label);

    const bookingsSnap = await getDocs(
      query(collection(db, "bookings"), where("bookingDate", "==", date)),
    );
    const booked = bookingsSnap.docs
      .map((d) => d.data() as { timeSlot: string; bookingStatus: string })
      .filter((b) => b.bookingStatus !== "cancelled")
      .map((b) => b.timeSlot);

    const bookedSet = new Set(booked);
    const available = slots.filter((s) => !bookedSet.has(s));

    return {
      content: [
        {
          type: "text",
          text: `Date ${date}: ${available.length} available, ${booked.length} booked.\nAvailable: ${available.join(", ") || "none"}\nBooked: ${booked.join(", ") || "none"}`,
        },
      ],
      structuredContent: { date, available, booked },
    };
  },
});
