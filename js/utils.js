// Fungsi untuk memformat angka menjadi format Rupiah
function formatRupiah(inputElement) {
    let value = inputElement.value.replace(/[^,\d]/g, '').toString();
    let split = value.split(',');
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        let separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
    inputElement.value = rupiah;
}

// Fungsi untuk mengkonversi format Rupiah ke angka desimal
function parseRupiahToFloat(rupiahString) {
    if (!rupiahString) return 0;
    return parseFloat(rupiahString.replace(/[Rp.]/g, '').replace(/,/g, '.'));
}

// Fungsi untuk mengkonversi angka desimal ke format Rupiah
function floatToRupiah(number) {
    if (typeof number !== 'number') return 'Rp 0,00';
    let reverse = number.toFixed(2).toString().split('').reverse().join('');
    let ribuan = reverse.match(/\d{1,3}/g);
    let result = ribuan.join('.').split('').reverse().join('');
    return 'Rp ' + result.replace('.', ','); // Menggunakan koma sebagai pemisah desimal
}

// Fungsi untuk mendapatkan tanggal saat ini dalam format YYYY-MM-DD
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}