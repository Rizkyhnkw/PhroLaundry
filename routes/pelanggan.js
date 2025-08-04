const express = require('express');
const router = express.Router();
const Pelanggan = require('./models/pelanggan'); // Asumsikan model sudah dipisahkan

// GET semua pelanggan
router.get('/', async (req, res) => {
    try {
        const pelanggan = await Pelanggan.find();
        res.json(pelanggan);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST pelanggan baru
router.post('/', async (req, res) => {
    const pelanggan = new Pelanggan(req.body);
    try {
        const newPelanggan = await pelanggan.save();
        res.status(201).json(newPelanggan);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;