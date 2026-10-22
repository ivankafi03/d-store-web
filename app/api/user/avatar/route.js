import { NextResponse } from 'next/server';
import { findUserByEmail, getAllUsers } from '@/lib/userAuth';

export const dynamic = 'force-dynamic';

function generateSvgAvatar(name, email, isOwner = false) {
  const initial = (name || email || 'U').trim().charAt(0).toUpperCase();
  const bg1 = isOwner ? '#059669' : '#2563eb';
  const bg2 = isOwner ? '#047857' : '#4f46e5';
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}" />
      <stop offset="100%" stop-color="${bg2}" />
    </linearGradient>
  </defs>
  <rect width="96" height="96" rx="48" fill="url(#grad)" />
  <text x="48" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="42" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initial}</text>
</svg>`;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get('email') || '').toLowerCase().trim();
    const isOwner = email === 'ivankafipradana@gmail.com';

    let user = null;
    if (email) {
      user = findUserByEmail(email);
    }

    const pictureUrl = user?.picture || searchParams.get('url');

    // Jika ada URL foto Google, coba ambil server-side dengan timeout
    if (pictureUrl && pictureUrl.startsWith('http')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(pictureUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
          }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const contentType = res.headers.get('content-type') || 'image/jpeg';
          const buffer = await res.arrayBuffer();

          return new Response(buffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
            }
          });
        }
      } catch {
        // Fallback ke SVG avatar di bawah jika jaringan gagal
      }
    }

    // Fallback resmi: SVG avatar bersih dengan inisial nama
    const svg = generateSvgAvatar(user?.name, user?.email || email, isOwner);
    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
      }
    });
  } catch {
    const defaultSvg = generateSvgAvatar('User', 'u', false);
    return new Response(defaultSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8'
      }
    });
  }
}
