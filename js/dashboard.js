// Data simulasi untuk user SKPD (akan diganti dengan API calls di produksi)
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Struktur data transaksi per SKPD (ini akan jadi database di produksi)
// Key adalah SKPD Name
let allSkpdData = JSON.parse(localStorage.getItem('allSkpdData')) || {};

// Inisialisasi data untuk SKPD saat ini jika belum ada
if (!allSkpdData[currentUser.skpdName]) {
    allSkpdData[currentUser.skpdName] = {
        saldoAwal: 0,
        tanggalSaldoAwal: '',
        transactions: [],
        unitData: {} // Untuk menyimpan data per unit SKPD
    };
    localStorage.setItem('allSkpdData', JSON.stringify(allSkpdData));
}

let currentSkpdData = allSkpdData[currentUser.skpdName];

// --- Daftar SKPD dan Unitnya ---
const skpdUnits = {
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
    // Tambahkan SKPD dan Unit lainnya di sini jika diperlukan
};

document.addEventListener('DOMContentLoaded', function() {
    if (!currentUser) {
        window.location.href = 'index.html'; // Redirect jika belum login
        return;
    }

    document.getElementById('skpdNameDisplay').textContent = currentUser.skpdName;
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

            // Refresh data saat pindah ke dashboard atau laporan
            if (this.dataset.section === 'dashboard') {
                updateDashboardSummary();
                displayRecentTransactions();
            } else if (this.dataset.section === 'laporan') {
                loadReport(); // Muat laporan dengan filter default
            }
        });
    });

    // Populate SKPD Unit menu if available
    if (skpdUnits[currentUser.skpdName]) {
        const skpdUnitMenu = document.getElementById('skpdUnitMenu');
        const skpdUnitList = document.getElementById('skpdUnitList');
        skpdUnitMenu.style.display = 'block';

        const units = skpdUnits[currentUser.skpdName];
        units.forEach(unit => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = unit;
            a.dataset.unitName = unit;
            a.addEventListener('click', function(e) {
                e.preventDefault();
                // Simpan unit yang sedang dipilih. Ini akan mempengaruhi input transaksi.
                // Di produksi, Anda mungkin ingin memfilter dashboard berdasarkan unit ini.
                console.log('Unit SKPD dipilih:', this.dataset.unitName);
                alert(`Anda sedang melihat data untuk unit: ${this.dataset.unitName}. (Fitur ini perlu pengembangan lebih lanjut untuk agregasi data per unit)`);
            });
            li.appendChild(a);
            skpdUnitList.appendChild(li);

            // Inisialisasi data untuk unit jika belum ada
            if (!currentSkpdData.unitData[unit]) {
                currentSkpdData.unitData[unit] = { transactions: [] };
            }
        });
        localStorage.setItem('allSkpdData', JSON.stringify(allSkpdData));
    }


    // --- Input Saldo Awal ---
    document.getElementById('formInputSaldoAwal').addEventListener('submit', function(e) {
        e.preventDefault();
        const saldoAwalValue = parseRupiahToFloat(document.getElementById('saldoAwalValue').value);
        const saldoAwalTanggal = document.getElementById('saldoAwalTanggal').value;
        const saldoAwalMessage = document.getElementById('saldoAwalMessage');

        if (saldoAwalValue <= 0) {
            saldoAwalMessage.textContent = 'Saldo awal harus lebih dari Rp 0,00.';
            saldoAwalMessage.style.color = 'red';
            return;
        }

        currentSkpdData.saldoAwal = saldoAwalValue;
        currentSkpdData.tanggalSaldoAwal = saldoAwalTanggal;
        localStorage.setItem('allSkpdData', JSON.stringify(allSkpdData));
        saldoAwalMessage.textContent = `Saldo Awal berhasil disimpan: ${floatToRupiah(saldoAwalValue)}`;
        saldoAwalMessage.style.color = 'green';
        updateDashboardSummary();
    });

    // Otomatis isi tanggal saat ini untuk input tanggal saldo awal
    document.getElementById('saldoAwalTanggal').value = getCurrentDate();


    // --- Input Transaksi ---
    document.getElementById('formInputTransaksi').addEventListener('submit', function(e) {
        e.preventDefault();
        const tanggal = document.getElementById('tanggalTransaksi').value;
        const jenis = document.getElementById('jenisTransaksi').value;
        const nominal = parseRupiahToFloat(document.getElementById('nominalTransaksi').value);
        const uraian = document.getElementById('uraianTransaksi').value;
        const noJurnal = document.getElementById('noJurnalTransaksi').value;
        const transaksiMessage = document.getElementById('transaksiMessage');

        if (nominal <= 0) {
            transaksiMessage.textContent = 'Nominal transaksi harus lebih dari Rp 0,00.';
            transaksiMessage.style.color = 'red';
            return;
        }

        const newTransaction = {
            id: Date.now(), // Unique ID
            noJurnal: noJurnal,
            tanggal: tanggal,
            jenis: jenis,
            nominal: nominal,
            uraian: uraian,
            skpdName: currentUser.skpdName,
            unitName: '' // Jika ada implementasi per unit, ini akan diisi
        };

        currentSkpdData.transactions.push(newTransaction);
        localStorage.setItem('allSkpdData', JSON.stringify(allSkpdData));

        transaksiMessage.textContent = 'Transaksi berhasil ditambahkan!';
        transaksiMessage.style.color = 'green';
        this.reset(); // Reset form
        document.getElementById('tanggalTransaksi').value = getCurrentDate(); // Set current date again
        updateDashboardSummary();
        displayRecentTransactions();
    });

    // Otomatis isi tanggal saat ini untuk input transaksi
    document.getElementById('tanggalTransaksi').value = getCurrentDate();

    // --- Laporan ---
    document.getElementById('btnTampilkanLaporan').addEventListener('click', loadReport);
    document.getElementById('unduhExcel').addEventListener('click', downloadExcel);
    document.getElementById('unduhPDF').addEventListener('click', downloadPdf);
    document.getElementById('unduhWord').addEventListener('click', downloadWord); // Perlu implementasi backend

    // Set filter tahun default ke tahun saat ini
    document.getElementById('filterTahun').value = new Date().getFullYear();

    // Initial load
    updateDashboardSummary();
    displayRecentTransactions();
});

function updateDashboardSummary() {
    const saldoAwal = currentSkpdData.saldoAwal;
    let totalPendapatan = 0;
    let totalPengeluaran = 0;

    currentSkpdData.transactions.forEach(t => {
        if (t.jenis === 'pendapatan') {
            totalPendapatan += t.nominal;
        } else if (t.jenis === 'pengeluaran') {
            totalPengeluaran += t.nominal;
        }
    });

    const sisaSaldo = saldoAwal + totalPendapatan - totalPengeluaran;

    document.getElementById('saldoAwalDisplay').textContent = floatToRupiah(saldoAwal);
    document.getElementById('totalPendapatanDisplay').textContent = floatToRupiah(totalPendapatan);
    document.getElementById('totalPengeluaranDisplay').textContent = floatToRupiah(totalPengeluaran);
    document.getElementById('sisaSaldoDisplay').textContent = floatToRupiah(sisaSaldo);
}

function displayRecentTransactions() {
    const tableBody = document.querySelector('#transactionTable tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    // Tampilkan 5 transaksi terbaru
    const recentTransactions = [...currentSkpdData.transactions]
                                .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
                                .slice(0, 5);

    if (recentTransactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">Belum ada transaksi.</td></tr>';
        return;
    }

    recentTransactions.forEach(t => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = t.noJurnal;
        row.insertCell().textContent = t.tanggal;
        row.insertCell().textContent = t.uraian;
        row.insertCell().textContent = t.jenis.charAt(0).toUpperCase() + t.jenis.slice(1);
        row.insertCell().textContent = floatToRupiah(t.nominal);
    });
}

function loadReport() {
    const tableBody = document.querySelector('#laporanTable tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    const filterBulan = document.getElementById('filterBulan').value;
    const filterTahun = document.getElementById('filterTahun').value;

    let filteredTransactions = currentSkpdData.transactions;

    if (filterBulan) {
        filteredTransactions = filteredTransactions.filter(t => t.tanggal.substring(5, 7) === filterBulan);
    }
    if (filterTahun) {
        filteredTransactions = filteredTransactions.filter(t => t.tanggal.substring(0, 4) === filterTahun);
    }

    // Sort by date ascending for proper running balance
    filteredTransactions.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    let runningBalance = currentSkpdData.saldoAwal; // Saldo awal untuk perhitungan laporan

    if (filteredTransactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">Tidak ada data transaksi untuk filter yang dipilih.</td></tr>';
        return;
    }

    filteredTransactions.forEach(t => {
        if (t.jenis === 'pendapatan') {
            runningBalance += t.nominal;
        } else if (t.jenis === 'pengeluaran') {
            runningBalance -= t.nominal;
        }

        const row = tableBody.insertRow();
        row.insertCell().textContent = t.noJurnal;
        row.insertCell().textContent = t.tanggal;
        row.insertCell().textContent = t.uraian;
        row.insertCell().textContent = t.jenis.charAt(0).toUpperCase() + t.jenis.slice(1);
        row.insertCell().textContent = floatToRupiah(t.nominal);
        row.insertCell().textContent = floatToRupiah(runningBalance);
    });
}

// --- Download Functions (Conceptual - requires libraries) ---

function downloadExcel() {
    const table = document.getElementById("laporanTable");
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Kas");
    XLSX.writeFile(wb, `${currentUser.skpdName}_Laporan_Kas_${new Date().toISOString().slice(0,10)}.xlsx`);
    alert('Laporan Excel berhasil diunduh!');
}

function downloadPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.autoTable({
        html: '#laporanTable',
        startY: 20,
        headStyles: { fillColor: [0, 123, 255] }, // Blue header
        theme: 'grid',
        didDrawPage: function(data) {
            doc.text(`Laporan Buku Kas - ${currentUser.skpdName}`, 14, 15);
        }
    });

    doc.save(`${currentUser.skpdName}_Laporan_Kas_${new Date().toISOString().slice(0,10)}.pdf`);
    alert('Laporan PDF berhasil diunduh!');
}

// Untuk download Word, ini lebih kompleks.
// Biasanya memerlukan library sisi server atau integrasi dengan API seperti Google Docs API.
// Untuk front-end murni, bisa coba konversi HTML, tapi hasilnya sering tidak optimal.
function downloadWord() {
    alert('Fitur unduh Word memerlukan pengembangan lebih lanjut (biasanya melibatkan sisi server).');
    // Contoh sederhana (tidak ideal untuk laporan kompleks):
    // let header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
    //              "xmlns:w='urn:schemas-microsoft-com:office:word' " +
    //              "xmlns='http://www.w3.org/TR/REC-html40'>" +
    //              "<head><meta charset='utf-8'><title>Laporan</title></head><body>";
    // let footer = "</body></html>";
    // let sourceHTML = header + document.getElementById('laporan-section').innerHTML + footer;

    // let fileName = `${currentUser.skpdName}_Laporan_Kas_${new Date().toISOString().slice(0,10)}.doc`;
    // let blob = new Blob(['\ufeff', sourceHTML], {
    //     type: 'application/msword'
    // });

    // let url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);

    // let downloadLink = document.createElement("a");
    // document.body.appendChild(downloadLink);
    // downloadLink.href = url;
    // downloadLink.download = fileName;
    // downloadLink.click();
    // document.body.removeChild(downloadLink);
}

// Logika untuk saldo awal otomatis dari bulan/tahun sebelumnya
// Ini memerlukan pemrosesan data historis yang lebih kompleks,
// idealnya ditangani oleh back-end yang bisa query data berdasarkan rentang waktu.
// Untuk simulasi front-end, ini akan lebih menantang.
function calculatePreviousBalance(targetDate) {
    // Fungsi ini akan menghitung saldo akhir dari periode sebelumnya (bulan/tahun)
    // Berdasarkan `currentSkpdData.transactions` dan `currentSkpdData.saldoAwal`.
    // Ini adalah logika yang kompleks dan membutuhkan penanganan tanggal yang cermat.
    // Misal: Untuk saldo awal Januari 2025, ambil saldo akhir Desember 2024.
    // Jika tidak ada data sebelumnya, ambil `currentSkpdData.saldoAwal` yang diinput manual.
    // Karena keterbatasan pure front-end, ini akan disederhanakan.
    // Anda bisa membiarkan user input saldo awal secara manual atau
    // mengimplementasikan logika ini di server.
    console.warn("Fungsi 'calculatePreviousBalance' perlu implementasi backend yang robust.");
    return currentSkpdData.saldoAwal; // Untuk demo, kembalikan saldo awal yang tersimpan
}