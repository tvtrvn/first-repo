"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

const HOVER_DELAY_MS = 400;

function formatViewCount(n: string | undefined): string {
  if (n === undefined || n === "") return "";
  const num = Number(n);
  if (Number.isNaN(num)) return n;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-VN", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export type VideoCardProps = {
  id: string;
  title?: string;
  channelTitle?: string;
  publishedAt?: string;
  thumbnailUrl?: string;
  viewCount?: string;
  likeCount?: string;
  rank?: number;
};

export function VideoCard({
  id,
  title,
  channelTitle,
  publishedAt,
  thumbnailUrl,
  viewCount,
  likeCount,
  rank,
}: VideoCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearTimer();
    hoverTimerRef.current = setTimeout(() => setShowPreview(true), HOVER_DELAY_MS);
  }, [clearTimer]);

  const handleMouseLeave = useCallback(() => {
    clearTimer();
    setShowPreview(false);
  }, [clearTimer]);

  const embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`;

  return (
    <li>
      <Link
        href={`https://www.youtube.com/watch?v=${id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group/card block overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--card-shadow)] transition-all duration-300 hover:border-[var(--card-border-hover)] hover:shadow-[var(--card-shadow-hover)]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-[var(--thumbnail-bg)]">
          {thumbnailUrl && (
            <>
              <img
                src={thumbnailUrl}
                alt={title ?? "Video"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
              />
              {showPreview && (
                <div className="absolute inset-0 z-10 bg-black/5">
                  <iframe
                    src={embedUrl}
                    title={title ?? "Video preview"}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </>
          )}
          {!thumbnailUrl && (
            <div className="flex h-full min-h-[140px] items-center justify-center text-[var(--muted)] text-sm">
              No thumbnail
            </div>
          )}
          {rank != null && (
            <span className="absolute left-2 top-2 z-20 rounded-md bg-black/70 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              #{rank}
            </span>
          )}
        </div>
        <div className="p-4">
          <h2 className="font-semibold text-[var(--heading)] line-clamp-2 transition-colors duration-200 group-hover/card:text-[var(--accent)]">
            {title ?? "Untitled"}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{channelTitle ?? "Unknown channel"}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0 text-xs text-[var(--muted)]">
            {viewCount && <span>{formatViewCount(viewCount)} views</span>}
            {likeCount && <span>{formatViewCount(likeCount)} likes</span>}
          </div>
          {publishedAt && (
            <p className="mt-1 text-xs text-[var(--muted)]">{formatDate(publishedAt)}</p>
          )}
        </div>
      </Link>
    </li>
  );
}
