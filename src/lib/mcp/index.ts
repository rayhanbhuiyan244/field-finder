import { defineMcp } from "@lovable.dev/mcp-js";
import listPricing from "./tools/list-pricing";
import listTimeslots from "./tools/list-timeslots";
import checkAvailability from "./tools/check-availability";
import listGallery from "./tools/list-gallery";
import getBusinessInfo from "./tools/get-business-info";

export default defineMcp({
  name: "kickoff-arena-mcp",
  title: "Kickoff Arena MCP",
  version: "0.1.0",
  instructions:
    "Public read-only tools for Kickoff Arena, a football turf booking site. Use these to browse pricing, time slots, availability by date, gallery photos, and business info. No bookings or writes are exposed.",
  tools: [listPricing, listTimeslots, checkAvailability, listGallery, getBusinessInfo],
});
