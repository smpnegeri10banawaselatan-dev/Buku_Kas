// Daftar lengkap SKPD
const daftarSkpd = [
    "Dinas Pendidikan dan Kebudayaan", "Dinas Kesehatan", "RSUD Kabelota Donggala",
    "Kecamatan Banawa", "Kecamatan Rio Pakava", "Dinas Komunikasi dan Informatika",
    "Kecamatan Sojol Utara", "Dinas Tanaman Pangan, Holtikultura dan Perkebunan",
    "Badan Kepegawaian dan Pengembangan Sumber Daya Manusia", "Dinas Ketahanan Pangan",
    "Satuan Polisi Pamong Praja", "Kecamatan Banawa Tengah", "Sekretariat DPRD",
    "Dinas Pekerjaan Umum dan Penataan Ruang", "Kecamatan Tanantovea",
    "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu",
    "Badan Penanggulangan Bencana Daerah", "Badan Perencanaan Pembangunan Daerah",
    "Sekretariat Daerah", "Kecamatan Sirenja", "Dinas Kependudukan dan Catatan Sipil",
    "Dinas Lingkungan Hidup Daerah", "Dinas Perpustakaan", "Kecamatan Labuan",
    "Badan Pendapatan Daerah", "Inspektorat", "Kecamatan Pinembani",
    "Dinas Pemuda dan Olahraga", "Dinas Peternakan dan Kesehatan Hewan",
    "Kecamatan Sindue Tobata", "Badan Kesatuan Bangsa dan Politik",
    "Kecamatan Balaesang Tanjung", "Kecamatan Banawa Selatan", "Dinas Koperasi dan UMKM",
    "Kecamatan Sindue Tombusabora", "Dinas Pemberdayaan Perempuan dan Perlindungan Anak",
    "Dinas Sosial", "Kecamatan Balaesang", "Dinas Tenaga Kerja dan Transmigrasi",
    "Badan Pengelolaan Keuangan dan Aset Daerah", "Kecamatan Dampelas",
    "Dinas Pengendalian Penduduk dan Keluarga Berencana",
    "Dinas Perumahan, Kawasan Pemukiman dan Pertanahan", "Kecamatan Sojol",
    "Dinas Perindustrian dan Perdagangan", "Dinas Perhubungan", "Dinas Pariwisata",
    "Dinas Pemberdayaan Masyarakat dan Desa", "Dinas Kearsipan",
    "Badan Penelitian dan Pengembangan", "Dinas Perikanan", "Kecamatan Sindue",
    "RSUD Pendau Tambu"
];

// Daftar unit SKPD (sama seperti di dashboard.js)
const skpdUnitsAdmin = {
    "Dinas Kesehatan": [
        "Puskesmas Pinembani", "Puskesmas Lembasada", "Puskesmas Wani", "Puskesmas Tonggolobibi",
        "Puskesmas Ogoamas", "Puskesmas Donggala", "Puskesmas Batusuya", "Puskesmas Lalundu",
        "Puskesmas Malei", "Puskesmas Delatope", "Puskesmas Toaya", "Puskesmas Tompe",
        "Puskesmas Kayuwou", "Puskesmas Labuan", "Puskesmas Sabang", "Puskesmas Tambu",
        "Puskesmas Balukang", "Puskesmas Lalundu Despot"
    ],
    "Sekretariat Daerah": [
        "Bagian Umum dan Tata Usaha", "Bagian Layanan Pengadaan Barang dan Jasa",
        "Bagian Administrasi Pembangunan", "Bagian Hukum", "Bagian Kesejahteraan Rakyat",
        "Bagian Protokol dan Komunikasi Pimpinan", "Bagian Administrasi Pemerintahan Umum",
        "Bagian Perekonomian dan SDA", "Bagian Organisasi dan Tata Laksana"
    ],
    "Kecamatan Banawa": [
        "Kelurahan Kabonga Besar", "Kelurahan Kabonga Kecil", "Kelurahan Labuan Bajo",
        "Kelurahan Tanjung Batu", "Kelurahan Boya", "Kelurahan Maleni", "Kelurahan Gunung Bale",
        "Kelurahan Ganti", "Kelurahan Boneoge"
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html'; // Redirect jika bukan admin
        return;
    }

    document.getElementById('btnLogout').addEventListener('click', logout);

    // Sidebar navigation
    document.querySelectorAll('.sidebar ul li a').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.sidebar ul li a').forEach(link => link.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.content section').forEach(section => {
                section.classList.add('hidden-section');
            });
            document.getElementById(`${this.dataset.section}-section`).classList.remove('hidden-section');

            if (this.dataset.section === 'dashboard-admin') {
                updateAdminDashboardSummary();
            } else if (this.dataset.section === 'user-management') {
                loadUserTable();
            } else if (this.dataset.section === 'all-skpd-report') {
                populateSkpdFilter();
                loadAdminReport();
            }
        });
    });

    // Initial load for admin dashboard
    updateAdminDashboardSummary();

    // Populate SKPD filter dropdown
    function populateSkpdFilter() {
        const filterSkpdAdmin = document.getElementById('filterSkpdAdmin');
        filterSkpdAdmin.innerHTML = '<option value="all">Semua SKPD</option>';
        daftarSkpd.forEach(skpd => {
            const option = document.createElement('option');
            option.value = skpd;
            option.textContent = skpd;
            filterSkpdAdmin.appendChild(option);
        });
    }

    // Handle change on SKPD filter to populate unit filter
    document.getElementById('filterSkpdAdmin').addEventListener('change', function() {
        const selectedSkpd = this.value;
        const filterUnitAdmin = document.getElementById('filterUnitAdmin');
        const labelFilterUnitAdmin = document.querySelector('label[for="filterUnitAdmin"]');

        filterUnitAdmin.innerHTML = '<option value="all">Semua Unit</option>';
        if (selectedSkpd !== 'all' && skpdUnitsAdmin[selectedSkpd]) {
            skpdUnitsAdmin[selectedSkpd].forEach(unit => {
                const option = document.createElement('option');
                option.value = unit;
                option.textContent = unit;
                filterUnitAdmin.appendChild(option);
            });
            filterUnitAdmin.style.display = 'block';
            labelFilterUnitAdmin.style.display = 'block';
        } else {
            filterUnitAdmin.style.display = 'none';
            labelFilterUnitAdmin.style.display = 'none';
        }
        loadAdminReport(); // Reload report based on new SKPD selection
    });

    // Set filter tahun default ke tahun saat ini
    document.getElementById('filterTahunAdmin').value = new Date().getFullYear();


    // Event listeners for report filtering
    document.getElementById('btnTampilkanLaporanAdmin').addEventListener('click', loadAdminReport);
    document.getElementById('unduhExcelAdmin').addEventListener('click', downloadExcelAdmin);
    document.getElementById('unduhPDFAdmin').addEventListener('click', downloadPdfAdmin);
    document.getElementById('unduhWordAdmin').addEventListener('click', downloadWordAdmin);
});

function updateAdminDashboardSummary() {
    const allSkpdData = JSON.parse(localStorage.getItem('allSkpdData')) || {};
    let totalGlobalSaldoAwal = 0;
    let totalGlobalPendapatan = 0;
    let totalGlobalPengeluaran = 0;

    const skpdSummaryTableBody = document.querySelector('#skpdSummaryTable tbody');
    skpdSummaryTableBody.innerHTML = '';

    for (const skpdName in allSkpdData) {
        const skpdData = allSkpdData[skpdName];
        const saldoAwal = skpdData.saldoAwal || 0;
        let pendapatan = 0;
        let pengeluaran = 0;

        skpdData.transactions.forEach(t => {
            if (t.jenis === 'pendapatan') {
                pendapatan += t.nominal;
            } else if (t.jenis === 'pengeluaran') {
                pengeluaran += t.nominal;
            }
        });

        const sisaSaldo = saldoAwal + pendapatan - pengeluaran;

        totalGlobalSaldoAwal += saldoAwal;
        totalGlobalPendapatan += pendapatan;
        totalGlobalPengeluaran += pengeluaran;

        const row = skpdSummaryTableBody.insertRow();
        row.insertCell().textContent = skpdName;
        row.insertCell().textContent = floatToRupiah(saldoAwal);
        row.insertCell().textContent = floatToRupiah(pendapatan);
        row.insertCell().textContent = floatToRupiah(pengeluaran);
        row.insertCell().textContent = floatToRupiah(sisaSaldo);
    }

    document.getElementById('totalGlobalSaldoAwal').textContent = floatToRupiah(totalGlobalSaldoAwal);
    document.getElementById('totalGlobalPendapatan').textContent = floatToRupiah(totalGlobalPendapatan);
    document.getElementById('totalGlobalPengeluaran').textContent = floatToRupiah(totalGlobalPengeluaran);
    document.getElementById('totalGlobalSisaSaldo').textContent = floatToRupiah(totalGlobalSaldoAwal + totalGlobalPendapatan - totalGlobalPengeluaran);
}

function loadUserTable() {
    const userTableBody = document.querySelector('#userTable tbody');
    userTableBody.innerHTML = '';
    const users = JSON.parse(localStorage.getItem('users')) || []; // Ambil dari local storage (main.js)

    users.forEach(user => {
        const row = userTableBody.insertRow();
        row.insertCell().textContent = user.username;
        row.insertCell().textContent = user.role.toUpperCase();
        row.insertCell().textContent = user.skpdName || '-';
        const actionCell = row.insertCell();
        if (user.role !== 'admin') { // Admin tidak bisa menghapus dirinya sendiri
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Hapus';
            deleteBtn.classList.add('btn', 'btn-danger', 'btn-small');
            deleteBtn.onclick = () => deleteUser(user.username);
            actionCell.appendChild(deleteBtn);
        }
    });
}

function deleteUser(username) {
    if (confirm(`Anda yakin ingin menghapus user ${username}?`)) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.filter(user => user.username !== username);
        localStorage.setItem('users', JSON.stringify(users));
        alert(`User ${username} berhasil dihapus.`);
        loadUserTable(); // Refresh table
    }
}


function loadAdminReport() {
    const tableBody = document.querySelector('#adminLaporanTable tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    const allSkpdData = JSON.parse(localStorage.getItem('allSkpdData')) || {};
    const filterSkpd = document.getElementById('filterSkpdAdmin').value;
    const filterUnit = document.getElementById('filterUnitAdmin').value;
    const filterBulan = document.getElementById('filterBulanAdmin').value;
    const filterTahun = document.getElementById('filterTahunAdmin').value;

    let combinedTransactions = [];

    for (const skpdName in allSkpdData) {
        if (filterSkpd === 'all' || skpdName === filterSkpd) {
            const skpdData = allSkpdData[skpdName];
            // Tambahkan transaksi utama SKPD
            skpdData.transactions.forEach(t => {
                combinedTransactions.push({ ...t, skpdName: skpdName, unitName: 'Utama' });
            });

            // Tambahkan transaksi dari unit SKPD
            if (skpdUnitsAdmin[skpdName]) { // Pastikan SKPD punya unit
                for (const unitName in skpdData.unitData) {
                    if (filterUnit === 'all' || unitName === filterUnit) {
                        skpdData.unitData[unitName].transactions.forEach(t => {
                            combinedTransactions.push({ ...t, skpdName: skpdName, unitName: unitName });
                        });
                    }
                }
            }
        }
    }

    // Filter berdasarkan bulan dan tahun
    let filteredTransactions = combinedTransactions.filter(t => {
        const transactionDate = new Date(t.tanggal);
        const transactionMonth = String(transactionDate.getMonth() + 1).padStart(2, '0');
        const transactionYear = String(transactionDate.getFullYear());

        let dateMatch = true;
        if (filterBulan && transactionMonth !== filterBulan) {
            dateMatch = false;
        }
        if (filterTahun && transactionYear !== filterTahun) {
            dateMatch = false;
        }
        return dateMatch;
    });

    // Sort by date ascending
    filteredTransactions.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));


    if (filteredTransactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">Tidak ada data transaksi untuk filter yang dipilih.</td></tr>';
        return;
    }

    filteredTransactions.forEach(t => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = t.noJurnal;
        row.insertCell().textContent = t.tanggal;
        row.insertCell().textContent = `${t.skpdName} (${t.unitName})`; // Menampilkan SKPD dan Unit
        row.insertCell().textContent = t.uraian;
        row.insertCell().textContent = t.jenis.charAt(0).toUpperCase() + t.jenis.slice(1);
        row.insertCell().textContent = floatToRupiah(t.nominal);
    });
}

// Download functions for admin (similar to SKPD dashboard, but for combined data)
function downloadExcelAdmin() {
    const table = document.getElementById("adminLaporanTable");
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Kas Global");
    XLSX.writeFile(wb, `Laporan_Kas_Global_${new Date().toISOString().slice(0,10)}.xlsx`);
    alert('Laporan Excel berhasil diunduh!');
}

function downloadPdfAdmin() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.autoTable({
        html: '#adminLaporanTable',
        startY: 20,
        headStyles: { fillColor: [0, 123, 255] },
        theme: 'grid',
        didDrawPage: function(data) {
            doc.text(`Laporan Buku Kas Global - Kab. Donggala`, 14, 15);
        }
    });

    doc.save(`Laporan_Kas_Global_${new Date().toISOString().slice(0,10)}.pdf`);
    alert('Laporan PDF berhasil diunduh!');
}

function downloadWordAdmin() {
    alert('Fitur unduh Word memerlukan pengembangan lebih lanjut (biasanya melibatkan sisi server).');
}