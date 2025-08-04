// File: app.js atau index.js

// 1. Import library yang dibutuhkan
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3000;
const pelangganRoutes = require('./routes/pelanggan');
const pesananRoutes = require('./routes/pesanan');

app.use('/api/pelanggan', pelangganRoutes);
app.use('/api/pesanan', pesananRoutes);

// Import model yang sudah dipisahkan
const Pelanggan = require('./models/pelanggan');
const Layanan = require('./models/layanan');
const Pesanan = require('./models/pesanan');

// Middleware untuk menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// 2. Middleware untuk parsing body request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Konfigurasi koneksi database
const mongoURI = 'mongodb://localhost:27017/laundryAppDB';

mongoose.connect(mongoURI)
.then(() => console.log('Koneksi ke database MongoDB berhasil!'))
.catch(err => console.error('Gagal terhubung ke database:', err));

// 4. Definisikan routes (Endpoint API)
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

// Contoh endpoint untuk mendapatkan semua pesanan (untuk frontend)
app.get('/api/pesanan', async (req, res) => {
  try {
    const pesanan = await Pesanan.find().populate('pelangganId').exec();
    res.json(pesanan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
