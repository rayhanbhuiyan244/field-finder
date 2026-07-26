import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useEffect, useState } from "react";
import { listGallery, type GalleryImage } from "@/services/gallerySettingsService";
import { SkeletonGallery, EmptyState, ErrorState } from "@/components/feedback";
import { ImageOff } from "lucide-react";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Kickoff Arena" },
      { name: "description", content: "See our floodlit turf, changing rooms and match-day atmosphere." },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = () => {
    setStatus("loading");
    listGallery()
      .then((imgs) => { setImages(imgs); setStatus("ready"); })
      .catch(() => setStatus("error"));
  };
  useEffect(load, []);
  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-7xl px-6 py-12">
        <span className="inline-block rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary">Gallery</span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Inside Kickoff Arena</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          A modern arena built for players — FIFA-grade turf, floodlights, premium changing rooms and a cafeteria.
        </p>

        <div className="mt-10">
          {status === "loading" && <SkeletonGallery />}
          {status === "error" && (
            <ErrorState variant="network" onRetry={load} />
          )}
          {status === "ready" && images.length === 0 && (
            <EmptyState
              icon={ImageOff}
              title="Gallery is empty"
              description="Photos of the arena will appear here once uploaded."
            />
          )}
          {status === "ready" && images.length > 0 && (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
              {images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.alt ?? "Arena photo"}
                  loading="lazy"
                  className="w-full rounded-2xl object-cover shadow-sm hover:shadow-lg transition-shadow"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}