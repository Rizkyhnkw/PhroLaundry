// 1. Import library yang dibutuhkan
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3000;

// 2. Middleware untuk parsing body request
// Menggunakan body-parser untuk memparsing JSON
app.use(bodyParser.json());
// Menggunakan extended: true agar bisa memparsing objek bersarang
app.use(bodyParser.urlencoded({ extended: true }));

// 3. Konfigurasi koneksi database (menggunakan MongoDB dengan Mongoose)
const mongoURI = 'mongodb://localhost:27017/laundryAppDB';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true, // Opsi ini sudah tidak diperlukan di versi Mongoose terbaru
  // useFindAndModify: false // Opsi ini juga sudah tidak diperlukan
})
.then(() => console.log('Koneksi ke database MongoDB berhasil!'))
.catch(err => console.error('Gagal terhubung ke database:', err));

// 4. Definisikan model (sesuai Class Diagram)
// File: models/pelanggan.js
const pelangganSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  nomorTelepon: { type: String, required: true, unique: true },
  alamat: String,
  email: String
});
const Pelanggan = mongoose.model('Pelanggan', pelangganSchema);

// File: models/layanan.js
const layananSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  harga: { type: Number, required: true },
  satuan: { type: String, required: true }
});
const Layanan = mongoose.model('Layanan', layananSchema);

// File: models/pesanan.js
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

// 5. Definisikan routes (Endpoint API)
app.get('/', (req, res) => {
  res.send('Selamat datang di API Laundry!');
});

// Contoh endpoint untuk membuat pelanggan baru
app.post('/api/pelanggan', async (req, res) => {
  try {
    const newPelanggan = new Pelanggan(req.body);
    await newPelanggan.save();
    res.status(201).json(newPelanggan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Contoh endpoint untuk mendapatkan semua pelanggan
app.get('/api/pelanggan', async (req, res) => {
  try {
    const pelanggan = await Pelanggan.find();
    res.json(pelanggan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.use(express.static('public'));

// 6. Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
