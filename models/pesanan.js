const mongoose = require('mongoose');

const pesananSchema = new mongoose.Schema({
  pelangganId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pelanggan', required: true },
  tanggalMasuk: { type: Date, default: Date.now },
  tanggalSelesai: Date,
  status: { type: String, enum: ['Baru Masuk', 'Sedang Diproses', 'Siap Diambil', 'Sudah Diambil'], default: 'Baru Masuk' },
  totalBiaya: { type: Number, default: 0 },
  statusPembayaran: { type: String, enum: ['Lunas', 'Belum Lunas'], default: 'Belum Lunas' },
  items: [{
    layananId: { type: mongoose.Schema.Types.ObjectId, ref: 'Layanan', required: true },
    berat: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }]
});

const Pesanan = mongoose.model('Pesanan', pesananSchema);

module.exports = Pesanan;