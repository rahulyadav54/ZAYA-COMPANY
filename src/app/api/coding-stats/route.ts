import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const platform = searchParams.get('platform') || 'leetcode';

  if (!username) {
    return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
  }

  try {
    if (platform === 'leetcode') {
      // 1. Fetch LeetCode Stats via LeetCode Stats API
      const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${encodeURIComponent(username)}`, {
        next: { revalidate: 3600 } // Cache for 1 hour
      });

      if (!res.ok) {
        return NextResponse.json({ 
          username, 
          platform: 'leetcode',
          status: 'notFound',
          totalSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          ranking: 'N/A',
          profileUrl: `https://leetcode.com/u/${encodeURIComponent(username)}/`
        });
      }

      const data = await res.json();
      return NextResponse.json({
        username,
        platform: 'leetcode',
        status: data.status === 'success' ? 'success' : 'notFound',
        totalSolved: data.totalSolved || 0,
        easySolved: data.easySolved || 0,
        mediumSolved: data.mediumSolved || 0,
        hardSolved: data.hardSolved || 0,
        acceptanceRate: data.acceptanceRate || 0,
        ranking: data.ranking || 'N/A',
        contributionPoints: data.contributionPoints || 0,
        profileUrl: `https://leetcode.com/u/${encodeURIComponent(username)}/`
      });
    } else if (platform === 'hackerrank') {
      // 2. Fetch HackerRank Profile Link
      return NextResponse.json({
        username,
        platform: 'hackerrank',
        status: 'success',
        profileUrl: `https://www.hackerrank.com/profile/${encodeURIComponent(username)}`
      });
    }

    return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
  } catch (error: any) {
    console.error('Fetch coding stats API error:', error);
    return NextResponse.json({
      username,
      platform,
      status: 'fallback',
      totalSolved: 0,
      profileUrl: platform === 'leetcode' 
        ? `https://leetcode.com/u/${encodeURIComponent(username)}/`
        : `https://www.hackerrank.com/profile/${encodeURIComponent(username)}`
    });
  }
}
