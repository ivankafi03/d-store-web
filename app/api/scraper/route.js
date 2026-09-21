import { NextResponse } from 'next/server';
import { 
  scrapeTelegramSupplier, 
  parseSupplierTextWithAI, 
  importParsedProducts, 
  isScraperBusy 
} from '@/lib/scraper';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    isBusy: isScraperBusy()
  });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    if (action === 'telegram_bot_scrape') {
      const { limit = 75, targetBot = 'heavenprem_bot' } = body;
      const result = await scrapeTelegramSupplier({ limit: Number(limit) || 75, targetBot });
      return NextResponse.json(result);
    }

    if (action === 'parse_text') {
      const { rawText, defaultSupplier = 'Toko Baru' } = body;
      const items = await parseSupplierTextWithAI(rawText, defaultSupplier);
      return NextResponse.json({ success: true, count: items.length, items });
    }

    if (action === 'import_parsed') {
      const { items } = body;
      const result = await importParsedProducts(items);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, message: 'Aksi scraper tidak dikenali' }, { status: 400 });
  } catch (err) {
    console.error('[API Scraper Error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
