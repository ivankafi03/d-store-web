import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { isAuthenticatedRequest } from '@/lib/auth';

export async function POST(request) {
  if (!isAuthenticatedRequest(request)) {
    return NextResponse.json({ status: 'error', message: 'Akses ditolak. Sesi tidak sah.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { status: 'error', message: 'Tidak ada file yang diunggah.' },
        { status: 400 }
      );
    }

    const originalName = file.name || 'image';
    const originalSize = file.size || 0;

    // Batasi ukuran maksimal 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (originalSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { status: 'error', message: 'Ukuran file terlalu besar. Maksimal 10MB.' },
        { status: 400 }
      );
    }

    // Validasi ekstensi & MIME type gambar yang diizinkan
    const ext = path.extname(originalName).toLowerCase();
    const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif'];
    const fileMime = (file.type || '').toLowerCase();
    const isImageMime = fileMime.startsWith('image/');

    if (!ALLOWED_EXT.includes(ext) && !isImageMime) {
      return NextResponse.json(
        { status: 'error', message: 'Format file tidak didukung. Hanya file gambar (JPG, PNG, WebP, SVG, GIF) yang diizinkan.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const baseName = path.parse(originalName).name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const timestamp = Date.now();

    // Khusus file SVG: Simpan langsung sebagai .svg tanpa rasterize
    if (file.type === 'image/svg+xml' || originalName.endsWith('.svg')) {
      const fileName = `${baseName}-${timestamp}.svg`;
      let finalUrl = null;

      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, buffer);
        finalUrl = `/uploads/${fileName}`;
      } catch (fsErr) {
        // Filesystem read-only (misal di serverless Vercel / AWS Lambda): fallback ke Data URI
        finalUrl = `data:image/svg+xml;base64,${buffer.toString('base64')}`;
      }

      return NextResponse.json({
        status: 'ok',
        url: finalUrl,
        fileName,
        format: 'svg',
        originalSize,
        convertedSize: originalSize,
        savedPercent: 0
      });
    }

    // Untuk semua file gambar (PNG, JPG, WEBP, dll):
    // Otomatis ubah & kompresi ke format WebP berkualitas tinggi
    const fileName = `${baseName}-${timestamp}.webp`;

    const convertedBuffer = await sharp(buffer)
      .rotate() // Memperbaiki orientasi EXIF kamera otomatis
      .resize({
        width: 1920,
        height: 1920,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: 80,
        effort: 4
      })
      .toBuffer();

    let finalUrl = null;
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, convertedBuffer);
      finalUrl = `/uploads/${fileName}`;
    } catch (fsErr) {
      // Filesystem read-only (misal di serverless Vercel / AWS Lambda): fallback ke Data URI WebP
      finalUrl = `data:image/webp;base64,${convertedBuffer.toString('base64')}`;
    }

    const convertedSize = convertedBuffer.length;
    const savedPercent = originalSize > 0 
      ? Math.max(0, Math.round(((originalSize - convertedSize) / originalSize) * 100))
      : 0;

    return NextResponse.json({
      status: 'ok',
      url: finalUrl,
      fileName,
      format: 'webp',
      originalSize,
      convertedSize,
      savedPercent
    });
  } catch (error) {
    console.error('Error saat konversi gambar ke WebP:', error);
    return NextResponse.json(
      { status: 'error', message: `Gagal memproses gambar: ${error.message}` },
      { status: 500 }
    );
  }
}
