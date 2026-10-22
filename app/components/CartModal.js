'use client';

import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Send } from 'lucide-react';

export default function CartModal({
  isOpen,
  onClose,
  cart,
  user = null,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}) {
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isOpen) return null;

  const formatRupiah = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

  const totalAmount = cart.reduce((acc, item) => {
    const qty = item.quantity || 1;
    const price = Number(item.price) || 0;
    return acc + (price * qty);
  }, 0);

  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const handleCheckoutWhatsApp = async () => {
    if (cart.length === 0 || isCheckingOut) return;
    setIsCheckingOut(true);

    try {
      const finalName = customerName.trim() || (user ? user.name : 'Pembeli');
      const finalPhone = customerPhone.trim() || (user ? user.phone : '');
      const finalEmail = user?.email || '';

      // Simpan pesanan ke database dan otomatis tersambung ke Buku Catatan D-Workspace
      let orderId = `DST-ORD-${Date.now().toString().slice(-6)}`;
      let orderTime = new Date().toLocaleString('id-ID');

      try {
        const res = await fetch('/api/user/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart,
            totalAmount,
            customerNotes,
            phone: finalPhone,
            name: finalName,
            email: finalEmail
          })
        });
        const data = await res.json();
        if (data?.orderId) orderId = data.orderId;
        if (data?.orderTime) orderTime = data.orderTime;
      } catch (postErr) {
        console.warn('Gagal sinkronisasi order server:', postErr);
      }

      let itemsListText = '';
      cart.forEach((item, index) => {
        const qty = item.quantity || 1;
        const variantName = item.variantName ? ` (${item.variantName})` : '';
        const subtotal = (Number(item.price) || 0) * qty;
        itemsListText += `${index + 1}. ${item.name}${variantName} [x${qty}] : ${formatRupiah(subtotal)}\n`;
      });

      let message = `Halo Admin D Store, saya ingin memesan lisensi resmi:\n\n`;
      message += `*RINCIAN PESANAN*\n`;
      message += `• Invoice : ${orderId}\n`;
      message += `• Waktu   : ${orderTime}\n`;
      message += `• Total   : ${totalItems} Item\n\n`;
      message += `*DAFTAR ITEM*\n${itemsListText}\n`;
      message += `*TOTAL PEMBAYARAN : ${formatRupiah(totalAmount)}*\n\n`;
      
      if (finalName || finalPhone || finalEmail) {
        message += `*DATA PEMBELI*\n`;
        if (finalName) message += `• Nama     : ${finalName}\n`;
        if (finalPhone) message += `• WhatsApp : ${finalPhone}\n`;
        if (finalEmail) message += `• Email    : ${finalEmail}\n`;
        message += `\n`;
      }
      if (customerNotes.trim()) {
        message += `*Catatan :* ${customerNotes.trim()}\n\n`;
      }
      message += `*METODE PEMBAYARAN*\n`;
      message += `• QRIS Otomatis / Transfer Bank\n\n`;
      message += `Mohon kirimkan QRIS dan instruksi pembayarannya. Terima kasih.`;

      if (onClearCart) onClearCart();
      onClose();

      const encoded = encodeURIComponent(message);
      const waUrl = `https://wa.me/6281230112240?text=${encoded}`;
      window.open(waUrl, '_blank');
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white text-zinc-900 rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 animate-in slide-in-from-bottom duration-250 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-950">
                Tas Belanja ({totalItems})
              </h2>
              <p className="text-[11px] text-zinc-500">
                Periksa daftar aplikasi sebelum checkout ke WhatsApp
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List Item */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 no-scrollbar">
          {cart.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-700">
                Tas belanja Anda masih kosong
              </p>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Pilih aplikasi atau varian paket yang Anda butuhkan di etalase toko.
              </p>
            </div>
          ) : (
            cart.map((item, index) => {
              const qty = item.quantity || 1;
              const subtotal = (Number(item.price) || 0) * qty;
              return (
                <div 
                  key={item.cartItemId || item.id || index}
                  className="p-3 rounded-xl border border-zinc-200/90 bg-white hover:border-zinc-300 transition flex items-center justify-between gap-3"
                >
                  {/* Thumbnail & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-12 h-12 rounded-lg object-cover bg-zinc-100 shrink-0 border border-zinc-200"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-950 truncate">
                        {item.name}
                      </h4>
                      {item.variantName && (
                        <p className="text-[11px] text-zinc-500 truncate">
                          {item.variantName}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-zinc-900 mt-0.5">
                        {formatRupiah(item.price)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(index, Math.max(1, qty - 1))}
                        className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition cursor-pointer"
                        title="Kurangi"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-zinc-900">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(index, qty + 1)}
                        className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition cursor-pointer"
                        title="Tambah"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 transition cursor-pointer"
                      title="Hapus item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Form Pembeli Opsional */}
          {cart.length > 0 && (
            <div className="pt-2 border-t border-zinc-100 space-y-2.5">
              {user ? (
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-blue-950 text-[11px] leading-tight">
                        {user.name} ({user.email})
                      </div>
                      <div className="text-[10px] text-blue-700">
                        Garansi resmi & ID Member {user.memberId || '-'} aktif
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-white text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    Terhubung
                  </span>
                </div>
              ) : null}

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                  Nama Anda (Opsional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                  Nomor WhatsApp Anda
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Contoh: Butuh aktivasi cepat untuk email pribadi"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer & Checkout Action */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50/70 space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-zinc-600">Total Pembayaran</span>
              <span className="font-extrabold text-base sm:text-lg text-black">
                {formatRupiah(totalAmount)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClearCart}
                disabled={isCheckingOut}
                className="px-3 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 disabled:opacity-50 text-zinc-600 text-xs font-semibold transition cursor-pointer"
                title="Kosongkan tas"
              >
                Kosongkan
              </button>

              <button
                type="button"
                onClick={handleCheckoutWhatsApp}
                disabled={isCheckingOut}
                className="flex-1 py-2.5 px-4 rounded-xl bg-black hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isCheckingOut ? 'Menyinkronkan Pesanan...' : 'Pesan Sekarang via WhatsApp'}</span>
              </button>
            </div>

            <p className="text-[10px] text-zinc-400 text-center">
              Pesanan akan otomatis dirangkum dan dikirimkan ke WhatsApp resmi D Store (081230112240).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
