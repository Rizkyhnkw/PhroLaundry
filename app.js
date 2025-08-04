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
const Pelanggan = require('../models/pelanggan');
const Layanan = require('../models/layanan');
const Pesanan = require('../models/pesanan');
 
// Middleware untuk menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')))
 
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

// Endpoint untuk mendapatkan semua layanan
app.get('/api/layanan', async (req, res) => {
  try {
    const layanan = await Layanan.find();
    res.json(layanan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Endpoint untuk membuat layanan baru
app.post('/api/layanan', async (req, res) => {
  const layanan = new Layanan(req.body);
  try {
    const newLayanan = await layanan.save();
    res.status(201).json(newLayanan);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
// Endpoint untuk mendapatkan semua pesanan
// Kode ini sudah diperbaiki untuk mengisi data pelanggan
app.get('/api/pesanan', async (req, res) => {
  try {
    const pesanan = await Pesanan.find().populate('pelangganId').exec();
    res.json(pesanan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Endpoint untuk membuat pesanan baru
app.post('/api/pesanan', async (req, res) => {
    try {
        const { pelangganId, items } = req.body;

        if (!pelangganId || !items || items.length === 0) {
            return res.status(400).json({ message: 'Data pelanggan dan item pesanan tidak boleh kosong.' });
        }

        // Hitung total biaya dari item yang dikirim
        let totalBiaya = 0;
        for (const item of items) {
            // Kita asumsikan subtotal sudah dihitung di frontend untuk kesederhanaan
            totalBiaya += item.subtotal;
        }

        const newPesanan = new Pesanan({
            pelangganId: pelangganId,
            items: items,
            totalBiaya: totalBiaya,
            status: 'Baru Masuk',
            statusPembayaran: 'Belum Lunas'
        });

        await newPesanan.save();
        res.status(201).json(newPesanan);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Endpoint untuk memperbarui status pesanan
app.put('/api/pesanan/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['Sedang Diproses', 'Siap Diambil', 'Sudah Diambil'].includes(status)) {
        return res.status(400).json({ message: 'Status tidak valid.' });
    }

    const updatedPesanan = await Pesanan.findByIdAndUpdate(
      id,
      { status: status },
      { new: true } // Mengembalikan dokumen yang sudah diperbarui
    );

    if (!updatedPesanan) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    res.json(updatedPesanan);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
