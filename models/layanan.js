const mongoose = require('mongoose');

const layananSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  harga: { type: Number, required: true },
  satuan: { type: String, required: true }
});
const Layanan = mongoose.model('Layanan', layananSchema);

module.exports = Layanan;