import { headers } from "next/headers";
import Link from "next/link";
import { VideoCard } from "./components/VideoCard";

async function getVideos(page: number) {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const base = `${protocol}://${host}`;
  const res = await fetch(`${base}/api/youtube/test?page=${page}`, { next: { revalidate: 3600 } });
  if (!res.ok) return { videos: [], error: true, pagination: null };
  const data = await res.json();
  return {
    videos: data.videos ?? [],
    error: data.error,
    pagination: data.pagination ?? null,
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const { videos, error, pagination } = await getVideos(page);
  const rankOffset = (pagination?.page ?? 1) * 50 - 50;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <header
        className="border-b px-4 py-6 sm:px-6"
        style={{
          background: "var(--header-bg)",
          color: "var(--header-text)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Top Vietnamese Pop music videos
          </h1>
          <p className="mt-1 text-sm opacity-85">
            Nhạc Pop Việt Nam · Sorted by view count · Hover to preview
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {error && (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor: "rgba(239,68,68,0.4)",
              background: "rgba(239,68,68,0.08)",
              color: "var(--foreground)",
            }}
          >
            Could not load videos. Check that <code className="rounded px-1 font-mono text-xs" style={{ background: "rgba(0,0,0,0.1)" }}>YOUTUBE_API_KEY</code> is set in <code className="rounded px-1 font-mono text-xs" style={{ background: "rgba(0,0,0,0.1)" }}>.env.local</code> and the API is enabled.
          </div>
        )}

        {!error && videos.length === 0 && (
          <p className="text-[var(--muted)]">No videos to show.</p>
        )}

        {!error && videos.length > 0 && (
          <>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map(
                (
                  video: {
                    id: string;
                    title?: string;
                    channelTitle?: string;
                    publishedAt?: string;
                    thumbnailUrl?: string;
                    viewCount?: string;
                    likeCount?: string;
                  },
                  index: number
                ) => (
                  <VideoCard
                    key={video.id}
                    {...video}
                    rank={rankOffset + index + 1}
                  />
                )
              )}
            </ul>

            {pagination && (
              <nav
                className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t pt-8"
                style={{ borderColor: "var(--card-border)" }}
                aria-label="Pagination"
              >
                {pagination.hasPrevPage && (
                  <Link
                    href={pagination.page === 2 ? "/" : `?page=${pagination.page - 1}`}
                    className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
                    style={{
                      background: "var(--card-bg)",
                      color: "var(--foreground)",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    ← Previous
                  </Link>
                )}
                <span className="px-3 py-2 text-sm text-[var(--muted)]">
                  Page {pagination.page} of {pagination.totalPages}
                  {pagination.totalCount > 0 && (
                    <span className="ml-1">
                      ({pagination.totalCount} videos)
                    </span>
                  )}
                </span>
                {pagination.hasNextPage && (
                  <Link
                    href={`?page=${pagination.page + 1}`}
                    className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
                    style={{
                      background: "var(--accent)",
                      color: "white",
                      border: "none",
                    }}
                  >
                    Next →
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
}
