export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) return new Response('URL is required', { status: 400 });

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error('Failed to fetch image');

    const blob = await res.blob();
    const contentType = res.headers.get('Content-Type') || 'image/jpeg';

    return new Response(blob, {
      headers: {
        'Content-Type': contentType,
        // ブラウザに1日間キャッシュさせる設定（パフォーマンス向上）
        'Cache-Control': 'public, max-age=86400, s-maxage=86400'
      }
    });
  } catch (error) {
    return new Response('Error fetching image', { status: 500 });
  }
}
