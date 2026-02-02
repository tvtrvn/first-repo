import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";

async function getVideos() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const base = `${protocol}://${host}`;
  const res = await fetch(`${base}/api/youtube/test`, { next: { revalidate: 3600 } });
  if (!res.ok) return { videos: [], error: true };
  const data = await res.json();
  return { videos: data.videos ?? [], error: data.error };
}

function formatDate(iso: string | undefined) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-VN", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function formatViewCount(n: string | undefined) {
  if (n === undefined || n === "") return "";
  const num = Number(n);
  if (Number.isNaN(num)) return n;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

export default async function Home() {
  const { videos, error } = await getVideos();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          Top 10 most viewed music videos in Vietnam
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8">
          Sorted by view count · Refreshes hourly
        </p>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 px-4 py-3 text-red-800 dark:text-red-200 text-sm">
            Could not load videos. Check that <code className="rounded bg-red-100 dark:bg-red-900/50 px-1">YOUTUBE_API_KEY</code> is set in <code className="rounded bg-red-100 dark:bg-red-900/50 px-1">.env.local</code> and the API is enabled.
          </div>
        )}

        {!error && videos.length === 0 && (
          <p className="text-zinc-500 dark:text-zinc-400">No videos to show.</p>
        )}

        {!error && videos.length > 0 && (
          <ul className="grid gap-6 sm:grid-cols-2">
            {videos.map((video: { id: string; title?: string; channelTitle?: string; publishedAt?: string; thumbnailUrl?: string; viewCount?: string; likeCount?: string }) => (
              <li key={video.id}>
                <Link
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm transition hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700"
                >
                  <div className="aspect-video relative bg-zinc-200 dark:bg-zinc-800">
                    {video.thumbnailUrl ? (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title ?? "Video"}
                        fill
                        className="object-cover transition group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, 50vw"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm">
                        No thumbnail
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h2 className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                      {video.title ?? "Untitled"}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {video.channelTitle ?? "Unknown channel"}
                    </p>
                    <div className="flex gap-3 mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                      {video.viewCount && (
                        <span>{formatViewCount(video.viewCount)} views</span>
                      )}
                      {video.likeCount && (
                        <span>{formatViewCount(video.likeCount)} likes</span>
                      )}
                    </div>
                    {video.publishedAt && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                        {formatDate(video.publishedAt)}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
