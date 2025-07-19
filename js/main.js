// Simulasi data user (ini akan diganti dengan data dari server/database di produksi)
// Struktur: username, password, role ('admin' atau 'skpd'), skpdName (jika role 'skpd')
const users = [
    { username: 'admin', password: 'adminpassword', role: 'admin' },
    { username: 'dinkes', password: 'dinkespass', role: 'skpd', skpdName: 'Dinas Kesehatan' },
    { username: 'sekda', password: 'sekdapass', role: 'skpd', skpdName: 'Sekretariat Daerah' },
    { username: 'kecbanawa', password: 'kecbanawapass', role: 'skpd', skpdName: 'Kecamatan Banawa' },
    // Tambahkan user SKPD lainnya sesuai daftar SKPD yang Anda berikan
];

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Mencegah form submit secara default

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const loginMessage = document.getElementById('loginMessage');

    // Cari user yang cocok
    const foundUser = users.find(user => user.username === usernameInput && user.password === passwordInput);

    if (foundUser) {
        loginMessage.textContent = ''; // Hapus pesan error jika ada
        // Simpan informasi user di localStorage atau sessionStorage (untuk simulasi)
        // Di produksi, ini akan diganti dengan token JWT atau session management dari server
        localStorage.setItem('currentUser', JSON.stringify(foundUser));

        if (foundUser.role === 'admin') {
            window.location.href = 'admin_dashboard.html'; // Redirect ke dashboard admin
        } else {
            window.location.href = 'dashboard.html'; // Redirect ke dashboard SKPD
        }
    } else {
        loginMessage.textContent = 'Username atau Password salah. Silakan masukkan kembali.';
    }
});

function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('showPassword');
    const toggleIcon = document.querySelector('.toggle-password');

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        showPasswordCheckbox.checked = true;
        toggleIcon.textContent = '🙈'; // Ganti ikon menjadi mata tertutup
    } else {
        passwordField.type = 'password';
        showPasswordCheckbox.checked = false;
        toggleIcon.textContent = '👁️'; // Ganti ikon menjadi mata terbuka
    }
}

// Fungsi untuk logout (akan dipanggil dari dashboard)
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}