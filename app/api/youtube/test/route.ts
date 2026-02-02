import { NextResponse } from 'next/server';

const API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET() {
  if (!API_KEY || API_KEY === 'paste_your_api_key_here') {
    return NextResponse.json(
      { error: 'YOUTUBE_API_KEY is not configured. Add your key to .env.local' },
      { status: 500 }
    );
  }

  try {
    // 1) Search for music videos in VN, sorted by view count (top 10 most viewed)
    const searchParams = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      order: 'viewCount',
      regionCode: 'VN',
      q: 'music videos in Vietnam',
      maxResults: '20',
      key: API_KEY,
    });
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${searchParams}`,
      { next: { revalidate: 3600 } }
    );
    if (!searchRes.ok) {
      const error = await searchRes.json();
      return NextResponse.json(
        { error: 'YouTube API error', details: error },
        { status: searchRes.status }
      );
    }
    const searchData = await searchRes.json();
    const videoIds = (searchData.items ?? [])
      .map((item: { id?: { videoId?: string } }) => item.id?.videoId)
      .filter(Boolean) as string[];
    if (videoIds.length === 0) {
      return NextResponse.json({ success: true, count: 0, videos: [] });
    }

    // 2) Get details (snippet + statistics) for those videos
    const videosParams = new URLSearchParams({
      part: 'snippet,statistics',
      id: videoIds.join(','),
      key: API_KEY,
    });
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${videosParams}`,
      { next: { revalidate: 3600 } }
    );
    if (!videosRes.ok) {
      const error = await videosRes.json();
      return NextResponse.json(
        { error: 'YouTube API error', details: error },
        { status: videosRes.status }
      );
    }
    const videosData = await videosRes.json();
    const videos = (videosData.items ?? []).map((item: {
      id: string;
      snippet?: { title?: string; channelTitle?: string; publishedAt?: string; thumbnails?: { medium?: { url?: string }; high?: { url?: string }; default?: { url?: string } } };
      statistics?: { viewCount?: string; likeCount?: string };
    }) => ({
      id: item.id,
      title: item.snippet?.title,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
      thumbnailUrl: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url,
      viewCount: item.statistics?.viewCount ?? undefined,
      likeCount: item.statistics?.likeCount ?? undefined,
    }));

    return NextResponse.json({
      success: true,
      count: videos?.length ?? 0,
      videos: videos ?? [],
    });
  } catch (err) {
    console.error('YouTube API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch from YouTube API' },
      { status: 500 }
    );
  }
}
