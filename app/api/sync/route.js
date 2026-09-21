import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { 
  pullFromGoogleSheet, 
  pushToGoogleSheet, 
  createSheetInGoogle, 
  addColumnInGoogle,
  exportToExcelBuffer,
  getDb,
  saveDb
} from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'export_excel') {
    try {
      const buffer = exportToExcelBuffer();
      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="Data_Toko_D_Store.xlsx"'
        }
      });
    } catch (err) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }

  if (action === 'backup_json') {
    const db = getDb();
    return new Response(JSON.stringify(db, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="d_one_backup_${new Date().toISOString().slice(0, 10)}.json"`
      }
    });
  }

  if (action === 'get_sheet_url') {
    const sheetUrl = process.env.GOOGLE_SHEET_URL || process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL || '';
    return NextResponse.json({ success: true, sheetUrl });
  }

  const res = await pullFromGoogleSheet();
  return NextResponse.json(res);
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'pull';

    if (action === 'push') {
      const res = await pushToGoogleSheet();
      return NextResponse.json(res);
    }

    if (action === 'create_sheet') {
      const { sheetName, headers } = body;
      const res = await createSheetInGoogle(sheetName, headers);
      return NextResponse.json(res);
    }

    if (action === 'add_column') {
      const { columnName, defaultValue } = body;
      const res = await addColumnInGoogle(columnName, defaultValue);
      return NextResponse.json(res);
    }

    if (action === 'restore_json') {
      const { data } = body;
      if (!data || !Array.isArray(data.products) || !Array.isArray(data.variants)) {
        return NextResponse.json({ success: false, message: 'Format data backup tidak valid' }, { status: 400 });
      }
      saveDb(data);
      return NextResponse.json({ success: true, message: 'Data cadangan berhasil dipulihkan!' });
    }

    if (action === 'save_sheet_url') {
      const { sheetUrl } = body;
      process.env.GOOGLE_SHEET_URL = sheetUrl || '';
      try {
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, 'utf8');
          if (envContent.includes('GOOGLE_SHEET_URL=')) {
            envContent = envContent.replace(/GOOGLE_SHEET_URL=.*/g, `GOOGLE_SHEET_URL=${sheetUrl || ''}`);
          } else {
            envContent += `\nGOOGLE_SHEET_URL=${sheetUrl || ''}\n`;
          }
          fs.writeFileSync(envPath, envContent, 'utf8');
        }
      } catch (err) {
        console.warn('Failed to persist GOOGLE_SHEET_URL to .env.local:', err.message);
      }
      return NextResponse.json({ success: true, sheetUrl: sheetUrl || '' });
    }

    const res = await pullFromGoogleSheet();
    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
