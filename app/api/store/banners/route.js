import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { isAuthenticatedRequest } from '@/lib/auth';
import {
  ZALORA_SPEED_DEALS,
  ZALORA_TRENDING,
  ZALORA_STEALS,
  ZALORA_APPLY_NOW,
  ZALORA_FEATURED_COLLECTIONS,
  ZALORA_SAVE_BANNERS
} from '@/lib/zaloraMenData';

const DEFAULT_HERO = [
  {
    id: 'hero-1',
    title: 'ZALORA 10.10 Flash Sale Adidas',
    subtitle: 'Flash Sale Berakhir Dalam 05:42:19',
    image: '/images/zalora-hero-top.png',
    link: '#',
    brand: 'ADIDAS'
  },
  {
    id: 'hero-2',
    title: 'Tommy Hilfiger Brand Day',
    subtitle: 'Diskon Hingga 50% + Voucher 15%',
    image: 'https://images.ctfassets.net/9q8du028z7sn/72LwXOzRKd7j03GjxUBF8B/a0171940ad0d92dee1eeda68e9a6fc06/225x225_BB2026_TOMMYHILFIGER.png',
    link: '#',
    brand: 'TOMMY HILFIGER'
  },
  {
    id: 'hero-3',
    title: 'On Running Swiss Engineering',
    subtitle: 'Extra Voucher 10% OFF',
    image: 'https://images.ctfassets.net/9q8du028z7sn/6JllWuRECk8AXKnFvPKoyM/4ed51d752d605cce34ebe6a2d9db6a2a/225x225_BB2026_ON.png',
    link: '#',
    brand: 'ON'
  }
];

export async function GET() {
  try {
    const db = getDb(true);
    if (!db.banners) {
      db.banners = {
        hero: DEFAULT_HERO,
        speedDeals: ZALORA_SPEED_DEALS,
        trending: ZALORA_TRENDING,
        steals: ZALORA_STEALS,
        apply: ZALORA_APPLY_NOW,
        featured: ZALORA_FEATURED_COLLECTIONS,
        saveBanners: ZALORA_SAVE_BANNERS
      };
      saveDb(db);
    }
    const visualEditorData = {
      ...(db.banners.visualEditorData || {}),
      ...(db.visualEditorData || {})
    };
    db.banners.visualEditorData = visualEditorData;
    db.visualEditorData = visualEditorData;

    return NextResponse.json({
      status: 'ok',
      banners: {
        ...db.banners,
        visualEditorData
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const isAuth = isAuthenticatedRequest(request);
  const host = request.headers.get('host') || '';
  const isLocalOrDev = process.env.NODE_ENV !== 'production' && (host.includes('localhost') || host.includes('192.168.') || host.includes('127.0.0.1'));

  if (!isAuth && !isLocalOrDev) {
    return NextResponse.json({ status: 'error', message: 'Akses ditolak. Sesi tidak sah.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { key, data } = body;
    const db = getDb();

    if (!db.banners) {
      db.banners = {
        hero: DEFAULT_HERO,
        speedDeals: ZALORA_SPEED_DEALS,
        trending: ZALORA_TRENDING,
        steals: ZALORA_STEALS,
        apply: ZALORA_APPLY_NOW,
        featured: ZALORA_FEATURED_COLLECTIONS,
        saveBanners: ZALORA_SAVE_BANNERS
      };
    }

    if (key && data) {
      db.banners[key] = data;
    } else if (body.banners) {
      db.banners = body.banners;
    }

    if (body.visualEditorData) {
      const merged = {
        ...(db.visualEditorData || {}),
        ...(db.banners.visualEditorData || {}),
        ...body.visualEditorData
      };
      db.visualEditorData = merged;
      db.banners.visualEditorData = merged;

      if (body.visualEditorData.topTierBanner) {
        db.banners.topTierBanner = body.visualEditorData.topTierBanner;
      }
      if (body.visualEditorData.heroSlide1) {
        db.banners.heroSlide1 = body.visualEditorData.heroSlide1;
      }
      if (body.visualEditorData.heroSlide2) {
        db.banners.heroSlide2 = body.visualEditorData.heroSlide2;
      }
      if (body.visualEditorData.heroSlide3) {
        db.banners.heroSlide3 = body.visualEditorData.heroSlide3;
      }
      if (body.visualEditorData.mainHeroBanner) {
        db.banners.mainHeroBanner = body.visualEditorData.mainHeroBanner;
      }
      if (Array.isArray(body.visualEditorData.trendList) && body.visualEditorData.trendList.length > 0) {
        db.banners.trending = body.visualEditorData.trendList;
      }
      if (Array.isArray(body.visualEditorData.speedDealsList) && body.visualEditorData.speedDealsList.length > 0) {
        db.banners.speedDeals = body.visualEditorData.speedDealsList;
      }
      if (Array.isArray(body.visualEditorData.discList) && body.visualEditorData.discList.length > 0) {
        db.banners.featured = body.visualEditorData.discList;
      }
      if (Array.isArray(body.visualEditorData.stealsList) && body.visualEditorData.stealsList.length > 0) {
        db.banners.steals = body.visualEditorData.stealsList;
      }
      if (Array.isArray(body.visualEditorData.applyList) && body.visualEditorData.applyList.length > 0) {
        db.banners.apply = body.visualEditorData.applyList;
      }
      if (Array.isArray(body.visualEditorData.saveList) && body.visualEditorData.saveList.length > 0) {
        db.banners.saveBanners = body.visualEditorData.saveList;
      }
    }

    saveDb(db);
    return NextResponse.json({ status: 'ok', banners: db.banners, visualEditorData: db.visualEditorData });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
