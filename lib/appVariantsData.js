// Data varian paket lengkap untuk setiap aplikasi di D Store
// Digunakan untuk Popup Modal Pilihan Paket dan Halaman Detail /store/app/[slug]

export const APP_VARIANTS_DATA = {
  spotify: {
    slug: 'spotify',
    name: 'Spotify Premium',
    brand: 'Spotify',
    tagline: 'Streaming Musik & Podcast Tanpa Iklan dengan Audio Lossless 320 kbps',
    description: 'Nikmati jutaan lagu tanpa jeda iklan, unduh lagu untuk diputar offline di mana saja, dan kualitas suara jernih maksimal. Dukungan aktivasi dan panduan 24/7.',
    initial: 'SPOT',
    badge: 'PALING POPULER',
    themeColor: '#1DB954',
    rating: 4.9,
    soldCount: '1.240+',
    features: [
      'Bebas Iklan Selamanya (No Ads)',
      'Bisa Download Lagu & Dengarkan Offline',
      'Audio Kualitas Tertinggi (Very High 320 kbps)',
      'Bebas Skip Lagu Tanpa Batas',
      'Support Android, iOS, Windows, Mac & Web Player',
      'Aktivasi Cepat & Panduan Pemakaian'
    ],
    accountTypes: [
      { id: 'new', name: 'Akun Baru dari D Store', desc: 'Email & Password disediakan tim D Store, langsung pakai.' },
      { id: 'own', name: 'Perpanjang Email Sendiri', desc: 'Kirimkan email Spotify Anda ke admin via WhatsApp.' }
    ],
    packages: [
      {
        id: 'spot-1m-ind',
        name: 'Spotify Individual (1 Bulan)',
        duration: '30 Hari',
        price: 15000,
        originalPrice: 55000,
        discount: '73% OFF',
        badge: 'BEST SELLER',
        popular: true,
        desc: '1 Akun Private, playlist bebas siap pakai.'
      },
      {
        id: 'spot-3m-ind',
        name: 'Spotify Individual (3 Bulan)',
        duration: '90 Hari',
        price: 40000,
        originalPrice: 165000,
        discount: '76% OFF',
        badge: 'HEMAT 76%',
        popular: false,
        desc: 'Masa aktif lebih panjang, anti ribet perpanjang tiap bulan.'
      },
      {
        id: 'spot-1m-fam-head',
        name: 'Spotify Family Plan - Head (1 Bulan)',
        duration: '30 Hari',
        price: 28000,
        originalPrice: 89000,
        discount: '68% OFF',
        badge: '6 SLOT AKUN',
        popular: false,
        desc: 'Akun Family Pengelola, bisa ajak s/d 5 orang teman/keluarga.'
      },
      {
        id: 'spot-1m-fam-member',
        name: 'Spotify Family Member (1 Bulan)',
        duration: '30 Hari',
        price: 12000,
        originalPrice: 35000,
        discount: '65% OFF',
        badge: 'TERMURAH',
        popular: false,
        desc: 'Slot anggota family legal, cukup kirim email Spotify Anda.'
      },
      {
        id: 'spot-1y-ind',
        name: 'Spotify Individual (1 Tahun / 12 Bulan)',
        duration: '365 Hari',
        price: 135000,
        originalPrice: 660000,
        discount: '80% OFF',
        badge: 'BEST VALUE',
        popular: false,
        desc: 'Paket sultan 1 tahun penuh, harga per bulan cuma Rp 11.250!'
      }
    ]
  },

  netflix: {
    slug: 'netflix',
    name: 'Netflix Premium 4K UHD',
    brand: 'Netflix',
    tagline: 'Nonton Film, Serial, Anime & Drama Korea Kualitas 4K Ultra HD & HDR',
    description: 'Akses penuh seluruh film dan serial Netflix tanpa batasan kuota tontonan. Akun anti-on hold resmi dengan resolusi gambar 4K UHD super tajam dan audio Dolby Atmos.',
    initial: 'NFLX',
    badge: 'BEST SELLER',
    themeColor: '#E50914',
    rating: 4.9,
    soldCount: '2.150+',
    features: [
      'Resolusi Ultra HD 4K + HDR & Dolby Atmos',
      'Anti On-Hold / Anti Checkpoint (Legal & Aman)',
      'Bisa Download Film & Tonton Offline',
      'Support TV Tabung/Smart TV, HP, Laptop, Tablet',
      'Profil Private dengan Kunci PIN Khusus',
      'Layanan Bantuan Selama Masa Aktif'
    ],
    accountTypes: [
      { id: 'private-profile', name: '1 Profil Private (PIN Sendiri)', desc: '1 Device aktif tonton bersamaan, history nonton terpisah aman.' },
      { id: 'full-account', name: '1 Akun Full (5 Profil Private)', desc: 'Bebas pakai untuk sekeluarga / teman tanpa batas profil.' }
    ],
    packages: [
      {
        id: 'net-1m-1p',
        name: 'Netflix 1 Profil Private PIN (1 Bulan)',
        duration: '30 Hari',
        price: 25000,
        originalPrice: 65000,
        discount: '62% OFF',
        badge: 'FAVORIT',
        popular: true,
        desc: '1 Profil khusus milik Anda dengan PIN pribadi, 1 Device aktif.'
      },
      {
        id: 'net-3m-1p',
        name: 'Netflix 1 Profil Private PIN (3 Bulan)',
        duration: '90 Hari',
        price: 70000,
        originalPrice: 195000,
        discount: '64% OFF',
        badge: 'HEMAT 64%',
        popular: false,
        desc: 'Nonton marathon 3 bulan tanpa takut akun terputus di tengah jalan.'
      },
      {
        id: 'net-1m-full',
        name: 'Netflix 1 Akun Penuh (5 Profil - 1 Bulan)',
        duration: '30 Hari',
        price: 110000,
        originalPrice: 186000,
        discount: '41% OFF',
        badge: 'AKUN PENUH',
        popular: false,
        desc: 'Milik sendiri 1 akun, bebas atur 5 profil & PIN untuk keluarga.'
      },
      {
        id: 'net-1w-pass',
        name: 'Netflix Weekend Pass (7 Hari)',
        duration: '7 Hari',
        price: 10000,
        originalPrice: 25000,
        discount: '60% OFF',
        badge: 'HEMAT KILAT',
        popular: false,
        desc: 'Cocok buat yang mau nonton serial/film tertentu di akhir pekan.'
      }
    ]
  },

  chatgpt: {
    slug: 'chatgpt',
    name: 'ChatGPT Plus (GPT-4o & Canvas)',
    brand: 'ChatGPT',
    tagline: 'Akses Model AI Tercanggih OpenAI GPT-4o, DALL-E 3 & Analisis Data',
    description: 'Tingkatkan produktivitas belajar, riset skripsi, coding, dan pembuatan konten dengan ChatGPT Plus. Respon lebih cepat, kuota tinggi, dan akses fitur Canvas terbaru.',
    initial: 'GPT',
    badge: 'AI TERBAIK',
    themeColor: '#10A37F',
    rating: 5.0,
    soldCount: '980+',
    features: [
      'Akses GPT-4o, GPT-4o mini, o1-preview & Canvas',
      'Upload File PDF, Excel, Gambar & Data Analitik',
      'Generate Gambar AI Realistis via DALL-E 3',
      'Browsing Web Real-Time & Custom GPTs',
      'Voice Mode Percakapan Suara Alami',
      'Akses Langsung Siap Pakai'
    ],
    accountTypes: [
      { id: 'shared', name: 'Shared Profile (Hemat)', desc: 'Akun premium bersama dengan limit wajar, sangat terjangkau.' },
      { id: 'private', name: 'Private Akun Baru', desc: 'Email khusus milik Anda sendiri tanpa campur orang lain.' }
    ],
    packages: [
      {
        id: 'gpt-1m-shared',
        name: 'ChatGPT Plus Shared (1 Bulan)',
        duration: '30 Hari',
        price: 45000,
        originalPrice: 350000,
        discount: '87% OFF',
        badge: 'PALING LARIS',
        popular: true,
        desc: 'Akses penuh fitur GPT-4o & DALL-E 3 dengan harga sangat hemat.'
      },
      {
        id: 'gpt-1m-team',
        name: 'ChatGPT Plus Team Workspace (1 Bulan)',
        duration: '30 Hari',
        price: 75000,
        originalPrice: 450000,
        discount: '83% OFF',
        badge: 'LIMIT TINGGI',
        popular: false,
        desc: 'Limit pesan 2x lebih besar dibanding paket plus standar.'
      },
      {
        id: 'gpt-1m-private',
        name: 'ChatGPT Plus Private 100% (1 Bulan)',
        duration: '30 Hari',
        price: 280000,
        originalPrice: 350000,
        discount: '20% OFF',
        badge: 'EKSKLUSIF',
        popular: false,
        desc: 'Akun private 100% milik Anda sendiri, privasi data terjamin aman.'
      }
    ]
  },

  canva: {
    slug: 'canva',
    name: 'Canva Pro Designer',
    brand: 'Canva',
    tagline: 'Desain Grafis Profesional Tanpa Batas dengan 100+ Juta Elemen & Template',
    description: 'Buka semua fitur Canva Pro mulai dari Brand Kit, Penghapus Latar Belakang (Magic Remover), Magic Switch, font premium, dan unduhan resolusi transparan kualitas tinggi.',
    initial: 'CNV',
    badge: 'SUPER VALUE',
    themeColor: '#00C4CC',
    rating: 4.9,
    soldCount: '3.400+',
    features: [
      'Akses 100+ Juta Foto, Video, Audio & Elemen Premium',
      'Penghapus Latar Belakang Sekali Klik (Background Remover)',
      'Magic Resize & Magic Switch ke Berbagai Ukuran',
      'Unduh Gambar dengan Latar Belakang Transparan & SVG',
      'Penyimpanan Cloud Ekstra Besar',
      'Panduan Aktivasi Cepat & Responsif'
    ],
    accountTypes: [
      { id: 'invite-own', name: 'Invite Email Canva Pribadi', desc: 'Cukup cantumkan email Canva Anda, tanpa perlu password.' },
      { id: 'ready-account', name: 'Akun Fresh dari Admin', desc: 'Disediakan email & password baru langsung siap pakai.' }
    ],
    packages: [
      {
        id: 'canva-lifetime-edu',
        name: 'Canva Pro Lifetime / Edu (1 Tahun+)',
        duration: '1 Tahun / Lifetime',
        price: 10000,
        originalPrice: 95000,
        discount: '89% OFF',
        badge: 'BEST SELLER',
        popular: true,
        desc: 'Harga termurah se-Indonesia, akses fitur Pro resmi bebas watermark.'
      },
      {
        id: 'canva-1y-team',
        name: 'Canva Pro Private Member (1 Tahun)',
        duration: '365 Hari',
        price: 25000,
        originalPrice: 150000,
        discount: '83% OFF',
        badge: 'TERLARIS',
        popular: false,
        desc: 'Akses penuh 1 tahun dengan fitur lengkap Canva Pro.'
      },
      {
        id: 'canva-1m-head',
        name: 'Canva Pro Bisnis Head (1 Bulan)',
        duration: '30 Hari',
        price: 35000,
        originalPrice: 199000,
        discount: '82% OFF',
        badge: 'PENGELOLA',
        popular: false,
        desc: 'Akun Admin/Head yang bisa mengundang s/d 500 anggota tim Anda.'
      }
    ]
  },

  youtube: {
    slug: 'youtube',
    name: 'YouTube Premium & YT Music',
    brand: 'YouTube',
    tagline: 'Tonton Video Tanpa Iklan, Putar di Latar Belakang & YouTube Music',
    description: 'Nonton YouTube sepuasnya tanpa gangguan iklan! Video tetap berputar saat layar HP dimatikan atau membuka aplikasi lain, plus akses jutaan lagu di YouTube Music.',
    initial: 'YT',
    badge: 'POPULER',
    themeColor: '#FF0000',
    rating: 4.8,
    soldCount: '1.800+',
    features: [
      'Nonton Bebas Iklan di TV, HP, Tablet & Laptop',
      'Putar Video di Latar Belakang (Background Play)',
      'Akses Penuh YouTube Music Premium',
      'Download Video Kualitas 1080p / 4K untuk Offline',
      'Cukup Kirim Email Gmail Anda (Tanpa Password)',
      'Akses Siap Pakai & Panduan Lengkap'
    ],
    accountTypes: [
      { id: 'invite-email', name: 'Invite Email Gmail Pribadi', desc: 'Kami kirimkan link family invite ke email Gmail Anda.' },
      { id: 'fresh-gmail', name: 'Akun Fresh Gmail Premium', desc: 'Disediakan akun email baru langsung aktif YouTube Premium.' }
    ],
    packages: [
      {
        id: 'yt-1m-ind',
        name: 'YouTube Premium Individual (1 Bulan)',
        duration: '30 Hari',
        price: 12000,
        originalPrice: 49000,
        discount: '75% OFF',
        badge: 'PALING LARIS',
        popular: true,
        desc: 'Bebas iklan 30 hari di email pribadi, no ribet.'
      },
      {
        id: 'yt-3m-ind',
        name: 'YouTube Premium (3 Bulan Paket Hemat)',
        duration: '90 Hari',
        price: 30000,
        originalPrice: 147000,
        discount: '79% OFF',
        badge: 'HEMAT 79%',
        popular: false,
        desc: 'Nonton bebas iklan 3 bulan berturut-turut harga terjangkau.'
      },
      {
        id: 'yt-1m-fam-slot',
        name: 'YouTube Family Slot Invite (1 Bulan)',
        duration: '30 Hari',
        price: 9000,
        originalPrice: 35000,
        discount: '74% OFF',
        badge: 'TERMURAH',
        popular: false,
        desc: 'Slot hemat via family invite resmi Google.'
      }
    ]
  },

  capcut: {
    slug: 'capcut',
    name: 'CapCut Pro Video Editor',
    brand: 'CapCut',
    tagline: 'Aplikasi Edit Video Paling Populer dengan AI Effects & Ekspor 4K',
    description: 'Buka semua efek VIP, transisi pro, fitur auto-caption multi bahasa, penghapus background otomatis, dan render video tanpa watermark dalam kualitas 4K 60fps.',
    initial: 'CPCT',
    badge: 'KREATOR PILIHAN',
    themeColor: '#262626',
    rating: 4.8,
    soldCount: '870+',
    features: [
      'Akses Semua Filter, Efek & Transisi VIP Pro',
      'Auto Caption & Subtitle Otomatis Akurat',
      'Ekspor Video Kualitas 4K Ultra HD 60 FPS',
      'Cloud Storage Tambahan untuk Proyek Video',
      'Support HP (Android & iOS) dan PC / Mac',
      'Panduan Aktivasi Cepat'
    ],
    accountTypes: [
      { id: 'shared', name: 'Shared Profile (Hemat)', desc: 'Akun bersama siap login, cocok untuk editing cepat.' },
      { id: 'private', name: 'Private Akun Sendiri', desc: 'Akun khusus Anda sendiri, bebas sinkronisasi cloud.' }
    ],
    packages: [
      {
        id: 'capcut-1m-shared',
        name: 'CapCut Pro Cloud Shared (1 Bulan)',
        duration: '30 Hari',
        price: 20000,
        originalPrice: 79000,
        discount: '75% OFF',
        badge: 'BEST SELLER',
        popular: true,
        desc: 'Buka semua fitur pro & ekspor 4K di HP/PC tanpa watermark.'
      },
      {
        id: 'capcut-1m-priv',
        name: 'CapCut Pro Private 1 Akun (1 Bulan)',
        duration: '30 Hari',
        price: 45000,
        originalPrice: 120000,
        discount: '62% OFF',
        badge: 'PRIVATE',
        popular: false,
        desc: 'Akun private 1 device bebas login kapan saja.'
      },
      {
        id: 'capcut-1y-shared',
        name: 'CapCut Pro 1 Tahun Penuh',
        duration: '365 Hari',
        price: 140000,
        originalPrice: 450000,
        discount: '69% OFF',
        badge: 'BEST VALUE',
        popular: false,
        desc: 'Edit konten TikTok/Reels/YouTube setahun penuh tanpa pusing.'
      }
    ]
  },



  disney: {
    slug: 'disney',
    name: 'Disney+ Hotstar 4K',
    brand: 'Disney+',
    tagline: 'Nonton Marvel, Star Wars, Pixar, Disney & Film Bioskop Indonesia',
    description: 'Streaming film blockbuster dunia dari Marvel Studios, Star Wars, film animasi Disney & Pixar terlengkap, hingga film lokal hits dengan resolusi 4K Ultra HD.',
    initial: 'DSNY',
    badge: 'BIOSKOP RUMAH',
    themeColor: '#113CCF',
    rating: 4.9,
    soldCount: '1.450+',
    features: [
      'Koleksi Lengkap Marvel, Star Wars, Pixar & National Geographic',
      'Kualitas Gambar 4K Ultra HD & Dolby Vision',
      'Audio Menggelegar Dolby Atmos 5.1',
      'Bisa Download Film untuk Tontonan Liburan',
      'Support HP, Smart TV, Android Box & Laptop',
      'Dukungan Teknis Lengkap'
    ],
    accountTypes: [
      { id: '1device', name: '1 Device Private', desc: '1 Perangkat aktif nonton, history profil tersimpan.' }
    ],
    packages: [
      {
        id: 'disney-1m',
        name: 'Disney+ Hotstar 1 Device (1 Bulan)',
        duration: '30 Hari',
        price: 22000,
        originalPrice: 65000,
        discount: '66% OFF',
        badge: 'TERLARIS',
        popular: true,
        desc: 'Kualitas 4K UHD, bisa di Smart TV / HP / Laptop.'
      },
      {
        id: 'disney-3m',
        name: 'Disney+ Hotstar 1 Device (3 Bulan)',
        duration: '90 Hari',
        price: 60000,
        originalPrice: 180000,
        discount: '66% OFF',
        badge: 'HEMAT 3 BULAN',
        popular: false,
        desc: 'Paket hemat nonton sekeluarga 3 bulan tanpa henti.'
      }
    ]
  },

  microsoft: {
    slug: 'microsoft',
    name: 'Microsoft 365 + 1TB OneDrive',
    brand: 'Microsoft 365',
    tagline: 'Aplikasi Office Resmi (Word, Excel, PowerPoint) + 1TB Cloud Storage',
    description: 'Tingkatkan produktivitas kerja dan perkuliahan dengan aplikasi Microsoft 365 asli yang selalu up-to-date. Termasuk penyimpanan cloud OneDrive super lega 1.000 GB (1TB).',
    initial: 'M365',
    badge: 'OFFICE RESMI',
    themeColor: '#D83B01',
    rating: 4.9,
    soldCount: '890+',
    features: [
      'Word, Excel, PowerPoint, Outlook, OneNote Selalu Update',
      '1 TB (1.000 GB) OneDrive Cloud Storage Aman',
      'Bisa Diinstall di 5 Perangkat (Windows, Mac, HP, iPad)',
      'Fitur AI Microsoft Copilot Basic Supported',
      'Anti Ransomware & Auto Backup Dokumen',
      'Akses Penuh Selama Masa Aktif'
    ],
    accountTypes: [
      { id: 'family-slot', name: 'Family Slot Invite Email Sendiri', desc: 'Invite resmi ke email Microsoft Outlook / Hotmail Anda.' },
      { id: 'fresh-acc', name: 'Akun Fresh Microsoft 365', desc: 'Email dan password baru langsung aktif siap pakai.' }
    ],
    packages: [
      {
        id: 'ms-1y-1tb',
        name: 'Microsoft 365 + 1TB OneDrive (1 Tahun)',
        duration: '365 Hari',
        price: 35000,
        originalPrice: 129000,
        discount: '73% OFF',
        badge: 'BEST SELLER',
        popular: true,
        desc: 'Lisensi resmi 1 tahun, install di 5 perangkat sekaligus!'
      },
      {
        id: 'ms-life-5tb',
        name: 'Microsoft 365 Lifetime / Edu + 5TB Cloud',
        duration: 'Lifetime',
        price: 55000,
        originalPrice: 250000,
        discount: '78% OFF',
        badge: 'LIFETIME 5TB',
        popular: false,
        desc: 'Cloud jumbo 5.000 GB tanpa biaya bulanan selamanya.'
      }
    ]
  },

  duolingo: {
    slug: 'duolingo',
    name: 'Duolingo Super Family',
    brand: 'Duolingo',
    tagline: 'Belajar Bahasa Asing Lebih Cepat Tanpa Batas Nyawa & Tanpa Iklan',
    description: 'Kuasai Bahasa Inggris, Jepang, Mandarin, Jerman, Prancis dan puluhan bahasa dunia dengan Duolingo Super. Bebas salah tanpa takut kehabisan nyawa (Unlimited Hearts)!',
    initial: 'DUO',
    badge: 'EDUKASI TERBAIK',
    themeColor: '#58CC02',
    rating: 4.9,
    soldCount: '740+',
    features: [
      'Nyawa Tanpa Batas (Unlimited Hearts) Bebas Belajar',
      'Bebas Iklan Pengganggu Selamanya',
      'Fitur Kuis Review Latihan Kesalahan Khusus',
      'Legendary Challenges Gratis Tanpa Bayar Gem',
      'Support Android, iPhone, iPad & Web',
      'Panduan Aktivasi Cepat'
    ],
    accountTypes: [
      { id: 'invite', name: 'Invite Email Duolingo Anda', desc: 'Cukup kirimkan username / email Duolingo Anda.' }
    ],
    packages: [
      {
        id: 'duo-1m',
        name: 'Duolingo Super Family Slot (1 Bulan)',
        duration: '30 Hari',
        price: 15000,
        originalPrice: 59000,
        discount: '74% OFF',
        badge: 'TERLARIS',
        popular: true,
        desc: 'Unlimited nyawa di akun Duolingo pribadi Anda.'
      },
      {
        id: 'duo-1y',
        name: 'Duolingo Super Family Slot (1 Tahun)',
        duration: '365 Hari',
        price: 45000,
        originalPrice: 299000,
        discount: '85% OFF',
        badge: 'SUPER HEMAT',
        popular: false,
        desc: 'Belajar bahasa intensif 1 tahun penuh, harga super murah!'
      }
    ]
  },

  surfshark: {
    slug: 'surfshark',
    name: 'Surfshark VPN Premium',
    brand: 'Surfshark',
    tagline: 'Buka Blokir Web, Akses Konten Luar Negeri & Proteksi Privasi 100%',
    description: 'Koneksi internet cepat tanpa batas kuota di lebih dari 100 negara. Fitur CleanWeb memblokir iklan berbahaya, malware, dan pelacak online secara otomatis.',
    initial: 'VPN',
    badge: 'CYBER SECURITY',
    themeColor: '#1AC8FF',
    rating: 4.8,
    soldCount: '520+',
    features: [
      'Server Cepat di 100+ Negara di Seluruh Dunia',
      'Bypass Geo-Block Netflix, ChatGPT & Game Online',
      'Fitur CleanWeb Anti Ads & Anti Malware',
      'Koneksi Enkripsi Militer AES-256-GCM',
      'Bisa Dipakai di Banyak Perangkat',
      'Dukungan Teknis Lengkap'
    ],
    accountTypes: [
      { id: 'shared', name: 'Shared Account Siap Pakai', desc: 'Email & Password login aplikasi langsung diberikan.' }
    ],
    packages: [
      {
        id: 'surf-1m',
        name: 'Surfshark VPN High Speed (1 Bulan)',
        duration: '30 Hari',
        price: 18000,
        originalPrice: 75000,
        discount: '76% OFF',
        badge: 'FAVORIT',
        popular: true,
        desc: 'Akses bebas internet tanpa batasan kuota dan kecepatan.'
      },
      {
        id: 'surf-1y',
        name: 'Surfshark VPN (1 Tahun Penuh)',
        duration: '365 Hari',
        price: 85000,
        originalPrice: 350000,
        discount: '75% OFF',
        badge: 'HEMAT 1 TAHUN',
        popular: false,
        desc: 'Proteksi internet aman setahun penuh di semua perangkat.'
      }
    ]
  },

  gmail: {
    slug: 'gmail',
    name: 'Gmail Fresh Terverifikasi',
    brand: 'Gmail',
    tagline: 'Akun Google Fresh Pembuatan Tim Aman & Anti HackBack',
    description: 'Akun Gmail baru berkualitas tinggi, bersih, siap pakai untuk pendaftaran berbagai layanan, media sosial, Google Play, atau kebutuhan bisnis digital.',
    initial: 'GML',
    badge: 'READY STOCK',
    themeColor: '#EA4335',
    rating: 4.9,
    soldCount: '4.200+',
    features: [
      'Akun Fresh Baru Dibuat oleh Tim D Store',
      'Sudah Verifikasi Aman & Siap Langsung Login',
      'Akun Baru Fresh Siap Digunakan',
      'Format Pengiriman Rapi (Email | Password | Recovery)',
      'Bisa Digunakan di Semua Perangkat Tanpa Ribet',
      'Stok Ribuan Akun Siap Kirim Kilat'
    ],
    accountTypes: [
      { id: 'standard', name: 'Format Standar (Email | Pass)', desc: 'Langsung dikirim via chat WhatsApp setelah transfer.' }
    ],
    packages: [
      {
        id: 'gmail-1acc',
        name: '1 Akun Gmail Fresh',
        duration: 'Permanen',
        price: 5000,
        originalPrice: 15000,
        discount: '66% OFF',
        badge: 'SATUAN',
        popular: true,
        desc: 'Akun Gmail baru siap pakai.'
      },
      {
        id: 'gmail-5acc',
        name: 'Paket 5 Akun Gmail Fresh',
        duration: 'Permanen',
        price: 22000,
        originalPrice: 60000,
        discount: '63% OFF',
        badge: 'PAKET 5',
        popular: false,
        desc: 'Harga cuma Rp 4.400 / akun untuk kebutuhan banyak.'
      },
      {
        id: 'gmail-10acc',
        name: 'Paket 10 Akun Gmail Fresh',
        duration: 'Permanen',
        price: 40000,
        originalPrice: 120000,
        discount: '66% OFF',
        badge: 'HEMAT 10 AKUN',
        popular: false,
        desc: 'Pilihan hemat untuk pendaftaran massal & agency.'
      }
    ]
  },

  bstation: {
    slug: 'bstation',
    name: 'Bstation Premium VIP (Bilibili)',
    brand: 'Bstation',
    tagline: 'Streaming Anime, Donghua & Serial Asia Resmi Kualitas HD 1080p Tanpa Iklan',
    description: 'Nikmati tontonan anime simulcast terbaru, donghua terpopuler, dan serial Asia dengan resolusi Full HD 1080p serta subtitle Bahasa Indonesia resmi tanpa jeda iklan.',
    initial: 'BST',
    badge: 'ANIME VIP',
    themeColor: '#00A1D6',
    rating: 4.9,
    soldCount: '870+',
    features: [
      'Bebas Iklan Seluruh Video & Episode Premium',
      'Resolusi Gambar Full HD 1080p & Audio Jernih',
      'Akses Duluan Episode Baru (Early Access Anime)',
      'Bisa Download Episode & Tonton Offline',
      'Mendukung HP Android, iOS, Tablet & Smart TV',
      'Aktivasi Cepat & Garansi Penuh D Store'
    ],
    accountTypes: [
      { id: 'shared', name: 'Sharing Profile (Hemat)', desc: 'Akun premium bersama hemat & stabil.' },
      { id: 'private', name: 'Private Account', desc: 'Akun khusus milik Anda sendiri tanpa campur orang lain.' }
    ],
    packages: [
      {
        id: 'bst-1m-shared',
        name: 'Bstation VIP 1 Bulan Sharing',
        duration: '30 Hari',
        price: 10000,
        originalPrice: 35000,
        discount: '71% OFF',
        badge: 'TERMURAH',
        popular: true,
        desc: 'Streaming anime tanpa iklan selama 30 hari penuh.'
      },
      {
        id: 'bst-3m-shared',
        name: 'Bstation VIP 3 Bulan Sharing',
        duration: '90 Hari',
        price: 13000,
        originalPrice: 85000,
        discount: '85% OFF',
        badge: 'BEST VALUE',
        popular: false,
        desc: 'Paket hemat 3 bulan, nonton puas sepanjang musim anime.'
      },
      {
        id: 'bst-1y-shared',
        name: 'Bstation VIP 1 Tahun Sharing',
        duration: '365 Hari',
        price: 20000,
        originalPrice: 199000,
        discount: '90% OFF',
        badge: 'SUPER HEMAT',
        popular: false,
        desc: 'Akses VIP 1 tahun penuh, harga per bulan hanya Rp 1.600-an!'
      },
      {
        id: 'bst-1m-private',
        name: 'Bstation VIP 1 Bulan Private',
        duration: '30 Hari',
        price: 33000,
        originalPrice: 65000,
        discount: '49% OFF',
        badge: 'PRIVATE',
        popular: false,
        desc: 'Akun private khusus untuk Anda, bebas login di perangkat Anda.'
      }
    ]
  },

  vidio: {
    slug: 'vidio',
    name: 'Vidio Premier Platinum',
    brand: 'Vidio',
    tagline: 'Nonton Liga Inggris, UCL, BRI Liga 1, Film & Original Series',
    description: 'Akses seluruh tayangan olahraga terlengkap, Vidio Original Series, drama Korea, anime, dan film blockbuster favorit Anda tanpa jeda iklan.',
    initial: 'VID',
    badge: 'SPORTS & FILM',
    themeColor: '#ED1C24',
    rating: 4.8,
    soldCount: '1.450+',
    features: [
      'Siaran Langsung Pertandingan Bola & Olahraga Dunia',
      'Akses Seluruh Vidio Original Series Eksklusif',
      'Resolusi Full HD 1080p & Kualitas Audio Mantap',
      'Bebas Iklan Tayangan Hiburan',
      'Garansi Penuh Selama Masa Aktif'
    ],
    accountTypes: [
      { id: 'mobile', name: 'Khusus HP / Mobile Only', desc: 'Bisa digunakan di aplikasi HP / Tablet.' },
      { id: 'all-device', name: 'All Device (HP + TV + Laptop)', desc: 'Bisa login di HP, Smart TV, atau Browser Laptop.' }
    ],
    packages: [
      {
        id: 'vid-1m-tv',
        name: 'Vidio Platinum 1 Bulan (TV Only)',
        duration: '30 Hari',
        price: 12000,
        originalPrice: 39000,
        discount: '69% OFF',
        badge: 'TV ONLY',
        popular: false,
        desc: 'Khusus login di Smart TV / Android TV.'
      },
      {
        id: 'vid-1m-mob-sh',
        name: 'Vidio Platinum 1 Bulan Sharing (Mobile)',
        duration: '30 Hari',
        price: 20000,
        originalPrice: 45000,
        discount: '55% OFF',
        badge: 'MOBILE HEMAT',
        popular: true,
        desc: 'Khusus streaming di HP & tablet Android / iOS.'
      },
      {
        id: 'vid-1m-alldev',
        name: 'Vidio Platinum 1 Bulan Private (All Device)',
        duration: '30 Hari',
        price: 43000,
        originalPrice: 89000,
        discount: '52% OFF',
        badge: 'ALL DEVICE',
        popular: false,
        desc: 'Akun private bebas login di HP, Laptop, atau Smart TV.'
      }
    ]
  },

  wetv: {
    slug: 'wetv',
    name: 'WeTV VIP',
    brand: 'WeTV',
    tagline: 'Nonton Drama China, Drama Korea & Series Asia VIP',
    description: 'Nonton episode terbaru drama favorit lebih awal dari pengguna gratis. Subtitle Bahasa Indonesia akurat dan resolusi gambar tajam Blu-ray Full HD.',
    initial: 'WETV',
    badge: 'DRACHIN VIP',
    themeColor: '#0084FF',
    rating: 4.8,
    soldCount: '920+',
    features: [
      'Akses Fast Track Episode VIP Terbaru',
      'Tanpa Gangguan Iklan di Semua Episode',
      'Resolusi Super Tajam Blu-ray 1080p',
      'Support Android, iOS, & Smart TV',
      'Aktivasi Cepat & Garansi Penuh'
    ],
    accountTypes: [
      { id: 'shared', name: 'Sharing Profile', desc: 'Akun bersama hemat terjangkau.' },
      { id: 'private', name: 'Private Account', desc: 'Akun pribadi khusus Anda sendiri.' }
    ],
    packages: [
      {
        id: 'wetv-1m-sh',
        name: 'WeTV VIP 1 Bulan Sharing',
        duration: '30 Hari',
        price: 11000,
        originalPrice: 39000,
        discount: '72% OFF',
        badge: 'TERMURAH',
        popular: true,
        desc: 'Nonton drama China & Korea bebas iklan 1 bulan.'
      },
      {
        id: 'wetv-1m-priv',
        name: 'WeTV VIP 1 Bulan Private',
        duration: '30 Hari',
        price: 30000,
        originalPrice: 65000,
        discount: '54% OFF',
        badge: 'PRIVATE',
        popular: false,
        desc: 'Akun private eksklusif tanpa campur orang lain.'
      }
    ]
  },

  viu: {
    slug: 'viu',
    name: 'Viu Premium',
    brand: 'Viu',
    tagline: 'Streaming Drama Korea, Variety Show & Anime Terbaru',
    description: 'Surganya pecinta Drakor! Nonton episode terbaru hanya selisih beberapa jam dari penayangan di Korea dengan subtitle Bahasa Indonesia resmi.',
    initial: 'VIU',
    badge: 'DRAKOR VIP',
    themeColor: '#FED600',
    rating: 4.9,
    soldCount: '2.400+',
    features: [
      'Nonton Drakor Bebas Iklan Sepuasnya',
      'Bisa Download Episode & Tonton Offline',
      'Subtitle Resmi Indonesia Cepat Rilis',
      'Anti Limit & Anti Hold',
      'Bisa Dipakai di HP, Laptop & TV'
    ],
    accountTypes: [
      { id: 'private', name: 'Private Account', desc: 'Akun private bebas limit garansi aman.' }
    ],
    packages: [
      {
        id: 'viu-3m-priv',
        name: 'Viu Premium 3 Bulan Private Anti Limit',
        duration: '90 Hari',
        price: 4000,
        originalPrice: 45000,
        discount: '91% OFF',
        badge: 'TERMURAH',
        popular: true,
        desc: 'Akses penuh 3 bulan seharga cuma empat ribu rupiah!'
      },
      {
        id: 'viu-1y-priv',
        name: 'Viu Premium 1 Tahun Private Anti Limit',
        duration: '365 Hari',
        price: 5000,
        originalPrice: 120000,
        discount: '96% OFF',
        badge: 'BEST VALUE',
        popular: false,
        desc: 'Nonton setahun penuh tanpa jeda iklan.'
      },
      {
        id: 'viu-life-priv',
        name: 'Viu Premium Lifetime Private Anti Limit',
        duration: 'Selamanya',
        price: 7000,
        originalPrice: 200000,
        discount: '97% OFF',
        badge: 'LIFETIME',
        popular: false,
        desc: 'Akses lifetime sepuasnya tanpa batas waktu.'
      }
    ]
  },

  gemini: {
    slug: 'gemini-ai',
    name: 'Gemini AI (Google Advanced)',
    brand: 'GEMINI AI',
    tagline: 'Model AI Terkuat Google dengan Konteks 1 Juta Token & Integrasi Workspace',
    description: 'Akses Gemini Advanced dengan model 1.5 Pro, kapasitas konteks dokumen 1 juta token, integrasi Gmail, Docs, Drive, dan analisis data berkecepatan tinggi.',
    initial: 'GEM',
    badge: 'GOOGLE AI',
    themeColor: '#4285F4',
    rating: 4.9,
    soldCount: '620+',
    features: [
      'Akses Gemini 1.5 Pro dengan Konteks 1 Juta Token',
      'Integrasi Langsung ke Google Docs, Gmail & Drive',
      'Analisis Data, Koding & Logika Penalaran Kompleks',
      'Generate Gambar AI Realistis Imagen 3',
      'Garansi Penuh Selama Masa Aktif'
    ],
    accountTypes: [
      { id: 'invite', name: 'Invite Email Pribadi', desc: 'Gunakan akun Google Anda sendiri tanpa perlu password.' },
      { id: 'fresh', name: 'Akun Fresh Google Baru', desc: 'Disediakan akun Google baru yang sudah aktif Gemini Pro.' }
    ],
    packages: [
      {
        id: 'gem-7d',
        name: 'Link Redeem 7d (Gemini Pro)',
        duration: '7 Hari',
        price: 7000,
        originalPrice: 25000,
        discount: '72% OFF',
        badge: 'TERMURAH',
        popular: false,
        desc: 'Paket redeem hemat 7 hari.'
      },
      {
        id: 'gem-1m-priv',
        name: 'Gemini 1m Privat v Invite',
        duration: '30 Hari',
        price: 10000,
        originalPrice: 300000,
        discount: '96% OFF',
        badge: 'BEST SELLER',
        popular: true,
        desc: 'Akses penuh Gemini 1.5 Pro selama 30 hari di email pribadi.'
      },
      {
        id: 'gem-3m-priv',
        name: 'Gemini 3m Private Via Invite',
        duration: '90 Hari',
        price: 18000,
        originalPrice: 900000,
        discount: '98% OFF',
        badge: 'HEMAT 98%',
        popular: false,
        desc: '3 bulan penuh produktivitas riset dan koding tanpa batas.'
      },
      {
        id: 'gem-1y-fam',
        name: 'Gemini 1y Famplan',
        duration: '365 Hari',
        price: 25000,
        originalPrice: 3600000,
        discount: '99% OFF',
        badge: 'BEST VALUE',
        popular: false,
        desc: 'Paket setahun penuh harga super terjangkau.'
      }
    ]
  }
};

// Helper untuk mencari app data berdasarkan query, brand, nama, atau link
// Mendukung pencarian statis dan pencarian dinamis ke seluruh database produk D Store
export function parseVariantDuration(name = '') {
  const low = String(name || '').toLowerCase();
  if (low.includes('1d') || low.includes('1 hari') || low.includes('1 day')) return '1 Hari';
  if (low.includes('3d') || low.includes('3 hari') || low.includes('3 day')) return '3 Hari';
  if (low.includes('5d') || low.includes('5 hari') || low.includes('5 day')) return '5 Hari';
  if (low.includes('7d') || low.includes('1w') || low.includes('7 hari') || low.includes('1 minggu')) return '7 Hari';
  if (low.includes('14d') || low.includes('2w') || low.includes('14 hari')) return '14 Hari';
  if (low.includes('1m') || low.includes('1 bln') || low.includes('1 bulan') || low.includes('30 hari') || low.includes('30d')) return '30 Hari';
  if (low.includes('2m') || low.includes('2 bln') || low.includes('2 bulan') || low.includes('60 hari')) return '60 Hari';
  if (low.includes('3m') || low.includes('3 bln') || low.includes('3 bulan') || low.includes('90 hari')) return '90 Hari';
  if (low.includes('6m') || low.includes('6 bln') || low.includes('6 bulan') || low.includes('180 hari')) return '180 Hari';
  if (low.includes('1y') || low.includes('1 thn') || low.includes('1 tahun') || low.includes('365 hari')) return '1 Tahun';
  return 'Sesuai Paket';
}

export function getAppVariantData(queryOrBrandOrItem, dbProducts = [], dbVariants = []) {
  if (!queryOrBrandOrItem) return null;

  let exactId = null;
  let textQuery = '';
  let linkQuery = '';

  if (typeof queryOrBrandOrItem === 'object') {
    exactId = queryOrBrandOrItem.id || null;

    const nameParts = [
      queryOrBrandOrItem.name,
      queryOrBrandOrItem.brand,
      queryOrBrandOrItem.title,
      queryOrBrandOrItem.label
    ].filter(Boolean);
    textQuery = nameParts.join(' ').toLowerCase().trim();

    if (queryOrBrandOrItem.link) {
      linkQuery = String(queryOrBrandOrItem.link)
        .replace(/https?:\/\/[^\/]+/g, '')
        .replace(/^\/store\/app\//, '')
        .replace(/^\/store\//, '')
        .replace(/[-_]/g, ' ')
        .trim()
        .toLowerCase();
    }
  } else {
    textQuery = String(queryOrBrandOrItem).toLowerCase().trim();
  }

  // 1. Prioritas Utama: Pencocokan langsung berdasarkan Product ID dari database
  if (exactId && Array.isArray(dbProducts) && dbProducts.length > 0) {
    const matched = dbProducts.find((p) => p.id === exactId);
    if (matched) {
      return buildResolvedAppData(matched, dbProducts, dbVariants);
    }
  }

  // 2. Query teks utama: Utamakan Name & Brand yang diketik user.
  // JANGAN gabungkan link lama jika user sudah mengisi nama/brand baru!
  const queryToUse = textQuery || linkQuery;
  if (!queryToUse) return null;

  const cleanQ = queryToUse.replace(/[-_]/g, ' ').trim();

  // 3. Pencocokan ke Database Produk Toko (107 Produk Riil)
  if (Array.isArray(dbProducts) && dbProducts.length > 0) {
    // 3a. Cocok tepat nama produk (Exact match)
    let matched = dbProducts.find((p) => p.name.toLowerCase().trim() === cleanQ);

    // 3b. Cocok slug produk
    if (!matched) {
      const qSlug = cleanQ.replace(/\s+/g, '-');
      matched = dbProducts.find((p) => {
        const pSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return pSlug === qSlug;
      });
    }

    // 3c. Cocok awalan atau kata utuh (Whole word / prefix match)
    if (!matched) {
      matched = dbProducts.find((p) => {
        const pName = p.name.toLowerCase().trim();
        return (
          pName === cleanQ ||
          pName.startsWith(cleanQ + ' ') ||
          pName.endsWith(' ' + cleanQ) ||
          cleanQ.startsWith(pName + ' ') ||
          cleanQ.endsWith(' ' + pName)
        );
      });
    }

    // 3d. Substring match (dengan memprioritaskan nama produk terpanjang agar tidak salah deteksi parsial)
    if (!matched) {
      const sortedProds = [...dbProducts].sort((a, b) => b.name.length - a.name.length);
      matched = sortedProds.find((p) => {
        const pName = p.name.toLowerCase().trim();
        return pName.length >= 3 && (cleanQ.includes(pName) || pName.includes(cleanQ));
      });
    }

    if (matched) {
      return buildResolvedAppData(matched, dbProducts, dbVariants);
    }
  }

  // 4. Fallback ke kamus statis jika produk tidak ditemukan di database produk
  for (const slug of Object.keys(APP_VARIANTS_DATA)) {
    if (cleanQ === slug || cleanQ.includes(slug)) {
      return APP_VARIANTS_DATA[slug];
    }
  }

  return null;
}

function buildResolvedAppData(matched, dbProducts = [], dbVariants = []) {
  const prodVars = Array.isArray(dbVariants) ? dbVariants.filter((v) => v.productId === matched.id) : [];
  // Urutkan varian dari harga termurah ke termahal
  prodVars.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));

  const cleanName = matched.name.toLowerCase();

  // Cari template pendamping untuk styling, tagline & icon jika tersedia
  let staticCompanion = null;
  for (const key of Object.keys(APP_VARIANTS_DATA)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      staticCompanion = APP_VARIANTS_DATA[key];
      break;
    }
  }

  const slug = staticCompanion?.slug || matched.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  let prodCategory = staticCompanion?.category || 'AI & Tools';
  const catMap = {
    'cat_1': 'AI & Tools',
    'cat_2': 'Streaming & Film',
    'cat_3': 'Desain & Video',
    'cat_4': 'Musik & Audio',
    'cat_5': 'Edukasi & Bahasa',
    'cat_6': 'VPN & Security',
    'cat_7': 'Office & Akun Tools'
  };
  if (matched.categoryId && catMap[matched.categoryId]) {
    prodCategory = catMap[matched.categoryId];
  } else if (matched.categoryName) {
    prodCategory = matched.categoryName;
  }

  // Gunakan varian asli dari database
  let realPackages = [];
  if (prodVars.length > 0) {
    realPackages = prodVars.map((v, idx) => ({
      id: v.id,
      name: v.name,
      duration: parseVariantDuration(v.name),
      price: Number(v.price) || 0,
      originalPrice: Math.round((Number(v.price) || 0) * 1.5),
      discount: '33% OFF',
      badge: idx === 0 ? 'TERLARIS' : 'RESMI',
      popular: idx === 0,
      isAvailable: v.isAvailable !== false,
      desc: v.name
    }));
  } else if (staticCompanion?.packages?.length > 0) {
    realPackages = staticCompanion.packages;
  } else {
    realPackages = [
      {
        id: `${matched.id}-std`,
        name: `${matched.name} Standar`,
        duration: '30 Hari',
        price: 15000,
        originalPrice: 30000,
        discount: '50% OFF',
        badge: 'RESMI',
        popular: true,
        isAvailable: true,
        desc: matched.description || 'Paket langganan resmi bergaransi.'
      }
    ];
  }

  return {
    slug,
    name: staticCompanion?.name || matched.name,
    brand: staticCompanion?.brand || matched.name.toUpperCase(),
    category: prodCategory,
    tagline: staticCompanion?.tagline || matched.description || 'Akun Lisensi Resmi & Bergaransi D Store',
    description: staticCompanion?.description || matched.description || 'Layanan resmi D Store dengan aktivasi cepat dan garansi penuh.',
    initial: staticCompanion?.initial || matched.name.slice(0, 3).toUpperCase(),
    badge: staticCompanion?.badge || (prodVars.length > 0 ? 'TERSEDIA' : 'PRODUK'),
    themeColor: staticCompanion?.themeColor || '#10B981',
    rating: staticCompanion?.rating || 4.9,
    soldCount: staticCompanion?.soldCount || '300+',
    features: staticCompanion?.features || [
      'Akun Lisensi Resmi D Store',
      'Garansi Penuh Selama Masa Aktif',
      'Aktivasi Cepat & Panduan Pemakaian'
    ],
    accountTypes: staticCompanion?.accountTypes || [
      { id: 'standard', name: 'Akun Siap Pakai', desc: 'Disediakan akun aktif resmi bergaransi.' }
    ],
    packages: realPackages
  };
}
