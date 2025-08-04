document.addEventListener('DOMContentLoaded', () => {
    // Fungsi untuk mengambil data pesanan dari backend
    async function fetchOrders() {
        try {
            const response = await fetch('/api/pesanan'); // Asumsi ada endpoint ini
            if (!response.ok) {
                throw new Error('Gagal mengambil data pesanan.');
            }
            const orders = await response.json();
            
            // Filter data pesanan
            const today = new Date().toISOString().split('T')[0];
            const ordersToday = orders.filter(order => order.tanggalMasuk.split('T')[0] === today);
            const readyOrders = orders.filter(order => order.status === 'Siap Diambil');
            
            // Hitung pendapatan hari ini
            const revenueToday = ordersToday.reduce((sum, order) => sum + (order.statusPembayaran === 'Lunas' ? order.totalBiaya : 0), 0);

            // Tampilkan data di kartu ringkasan
            document.getElementById('ordersTodayCount').innerText = ordersToday.length;
            document.getElementById('readyOrdersCount').innerText = readyOrders.length;
            document.getElementById('revenueToday').innerText = `Rp ${revenueToday.toLocaleString('id-ID')}`;

            // Tampilkan daftar pesanan terbaru
            const latestOrdersTableBody = document.getElementById('latestOrdersTableBody');
            latestOrdersTableBody.innerHTML = ''; // Kosongkan tabel
            orders.slice(0, 5).forEach(order => { // Ambil 5 pesanan terbaru
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${order.id.slice(-6)}</td>
                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${order.pelangganId.nama}</td>
                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${order.status}</td>
                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">Rp ${order.totalBiaya.toLocaleString('id-ID')}</td>
                `;
                latestOrdersTableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Error:', error);
            // Tampilkan pesan error di UI jika diperlukan
        }
    }

    fetchOrders();
});
