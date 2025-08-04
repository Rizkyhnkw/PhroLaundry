const express = require('express');
const router = express.Router();
const Pesanan = require('./models/pesanan'); // Asumsikan model sudah dipisahkan
const Layanan = require('./models/layanan'); // Asumsikan model sudah dipisahkan

// GET semua pesanan
router.get('/', async (req, res) => {
    try {
        const pesanan = await Pesanan.find().populate('pelangganId').exec();
        res.json(pesanan);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST pesanan baru
router.post('/', async (req, res) => {
    try {
        const { pelangganId, items } = req.body;
        
        if (!pelangganId || !items || items.length === 0) {
            return res.status(400).json({ message: 'Data pelanggan dan item pesanan tidak boleh kosong.' });
        }

        // Hitung total biaya dari item yang dikirim
        let totalBiaya = 0;
        for (const item of items) {
            // Asumsi item.subtotal sudah dihitung di frontend
            // Jika ingin dihitung di backend, perlu fetch harga dari model Layanan
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

// Endpoint untuk update status pesanan
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedPesanan = await Pesanan.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );

        if (!updatedPesanan) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        res.json(updatedPesanan);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;