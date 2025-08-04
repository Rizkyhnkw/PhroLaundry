document.addEventListener('DOMContentLoaded', () => {
    const customerNameInput = document.getElementById('customerName');
    const pelangganIdInput = document.getElementById('pelangganId');
    const customerSuggestions = document.getElementById('customerSuggestions');
    const addServiceItemButton = document.getElementById('addServiceItem');
    const serviceItemsContainer = document.getElementById('serviceItems');
    const totalCostDisplay = document.getElementById('totalCost');
    const newOrderForm = document.getElementById('newOrderForm');

    let allServices = []; // Untuk menyimpan data layanan dari backend

    // Fungsi untuk mengambil daftar layanan dari backend
    async function fetchServices() {
        try {
            const response = await fetch('/api/layanan');
            if (!response.ok) throw new Error('Gagal mengambil data layanan.');
            allServices = await response.json();
            addServiceItem(); // Tambahkan item layanan pertama secara default
        } catch (error) {
            console.error('Error fetching services:', error);
            alert('Gagal memuat data layanan. Silakan coba lagi.');
        }
    }

    // Fungsi untuk membuat item layanan baru di form
    function createServiceItem(itemIndex) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex space-x-4 items-center';
        itemDiv.innerHTML = `
            <select name="layananId" class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Pilih Layanan --</option>
                ${allServices.map(service => `<option value="${service._id}" data-harga="${service.harga}">${service.nama} (${service.harga}/${service.satuan})</option>`).join('')}
            </select>
            <input type="number" name="berat" placeholder="Berat (kg)" step="0.1" class="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span class="subtotal w-24 text-right">Rp 0</span>
            <button type="button" class="removeServiceItem text-red-500 hover:text-red-700">Hapus</button>
        `;
        serviceItemsContainer.appendChild(itemDiv);
    }

    // Fungsi untuk menambahkan item layanan
    function addServiceItem() {
        const itemCount = serviceItemsContainer.children.length;
        createServiceItem(itemCount);
    }

    // Fungsi untuk menghitung total biaya
    function calculateTotalCost() {
        let total = 0;
        document.querySelectorAll('#serviceItems > div').forEach(itemDiv => {
            const selectElement = itemDiv.querySelector('select[name="layananId"]');
            const beratInput = itemDiv.querySelector('input[name="berat"]');
            
            if (selectElement && beratInput) {
                const selectedOption = selectElement.options[selectElement.selectedIndex];
                const harga = parseFloat(selectedOption.dataset.harga) || 0;
                const berat = parseFloat(beratInput.value) || 0;
                const subtotal = harga * berat;

                itemDiv.querySelector('.subtotal').innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
                total += subtotal;
            }
        });
        totalCostDisplay.innerText = `Rp ${total.toLocaleString('id-ID')}`;
    }

    // Event listener untuk tombol 'Tambah Layanan'
    addServiceItemButton.addEventListener('click', addServiceItem);

    // Event listener untuk perubahan pada form layanan
    serviceItemsContainer.addEventListener('input', (event) => {
        if (event.target.matches('select[name="layananId"]') || event.target.matches('input[name="berat"]')) {
            calculateTotalCost();
        }
    });

    // Event listener untuk menghapus item layanan
    serviceItemsContainer.addEventListener('click', (event) => {
        if (event.target.matches('.removeServiceItem')) {
            event.target.closest('div').remove();
            calculateTotalCost();
        }
    });

    // Event listener untuk submit form pesanan baru
    newOrderForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const pelangganId = pelangganIdInput.value;
        if (!pelangganId) {
            alert('Silakan pilih atau tambahkan pelanggan terlebih dahulu.');
            return;
        }

        const items = [];
        document.querySelectorAll('#serviceItems > div').forEach(itemDiv => {
            const layananId = itemDiv.querySelector('select[name="layananId"]').value;
            const berat = parseFloat(itemDiv.querySelector('input[name="berat"]').value);
            const subtotal = parseFloat(itemDiv.querySelector('.subtotal').innerText.replace(/[^0-9,-]/g, '').replace(',', '.'));
            
            if (layananId && berat > 0) {
                items.push({ layananId, berat, subtotal });
            }
        });

        if (items.length === 0) {
            alert('Pesanan harus memiliki setidaknya satu item layanan.');
            return;
        }

        try {
            const response = await fetch('/api/pesanan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pelangganId, items })
            });

            if (!response.ok) {
                throw new Error('Gagal membuat pesanan baru.');
            }

            const newOrder = await response.json();
            alert(`Pesanan ${newOrder._id} berhasil dibuat!`);
            window.location.href = 'index.html'; // Redirect ke dashboard
        } catch (error) {
            console.error('Error:', error);
            alert(`Terjadi kesalahan: ${error.message}`);
        }
    });

    // Event listener untuk pencarian pelanggan (sederhana)
    customerNameInput.addEventListener('input', async () => {
        const query = customerNameInput.value.trim();
        if (query.length > 2) {
            try {
                const response = await fetch(`/api/pelanggan?nama=${query}`);
                const pelangganList = await response.json();
                
                customerSuggestions.innerHTML = '';
                if (pelangganList.length > 0) {
                    pelangganList.forEach(pelanggan => {
                        const div = document.createElement('div');
                        div.className = 'p-2 cursor-pointer hover:bg-gray-200';
                        div.innerText = pelanggan.nama;
                        div.addEventListener('click', () => {
                            customerNameInput.value = pelanggan.nama;
                            pelangganIdInput.value = pelanggan._id;
                            customerSuggestions.classList.add('hidden');
                        });
                        customerSuggestions.appendChild(div);
                    });
                    customerSuggestions.classList.remove('hidden');
                } else {
                    customerSuggestions.classList.add('hidden');
                }
            } catch (error) {
                console.error('Error fetching customers:', error);
            }
        } else {
            customerSuggestions.classList.add('hidden');
        }
    });

    fetchServices();
});
