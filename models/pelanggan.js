const mongoose = require('mongoose');

const pelangganSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  nomorTelepon: { type: String, required: true, unique: true },
  alamat: String,
  email: String
});
const Pelanggan = mongoose.model('Pelanggan', pelangganSchema);

module.exports = Pelanggan;