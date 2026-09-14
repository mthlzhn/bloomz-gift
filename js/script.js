async function ambilUlasan() { // fungsi buat ambil data ulasan dari api
    try {
        const res = await fetch("https://6a8b036755d899aede9b947c.mockapi.io/api/data"); // minta data ke alamat api, tunggu sampai selesai
        const data = await res.json(); // ubah balesan server jadi bentuk objek javascript
        const daftarUlasan = data?.[0]?.reviews ?? []; // ambil daftar ulasan dari data, kalau nggak ada isi array kosong
        return daftarUlasan; // kasih balik daftar ulasan buat dipakai di tempat lain
    } catch { // kalau fetch gagal (koneksi bermasalah, server nggak bisa diakses, dll)
        return []; // kasih balik array kosong biar kode di bawah tetap jalan aman
    }
}

function buatKartuUlasan(ulasan) { // fungsi buat bikin satu kartu ulasan
    const card = document.createElement("div"); // bikin kotak pembungkus kartu
    card.classList.add("review-card"); // kasih nama kelas buat kartu ulasan

    const headerUlasan = document.createElement("span"); // wadah utk img+nama
    headerUlasan.classList.add("review-header"); // kelas buat wadah header kartu

    const img = document.createElement("img"); // bikin elemen gambar foto pengulas
    img.classList.add("review-img"); // kelas buat gambar ulasan
    img.src = ulasan.avatar; // pasang sumber gambar sesuai data ulasan
    img.alt = ulasan.nama; // teks alternatif gambar, isinya nama pengulas

    const nama = document.createElement("h3"); // bikin judul nama pengulas
    nama.classList.add("review-name"); // kelas buat nama pengulas
    nama.textContent = ulasan.nama; // isi teksnya sesuai nama pengulas

    headerUlasan.appendChild(img); // pasang gambar ke header
    headerUlasan.appendChild(nama); // pasang nama ke header
    card.appendChild(headerUlasan); // pasang header ke kartu

    const komentar = document.createElement("p"); // bikin elemen buat isi komentar ulasan
    komentar.classList.add("review-comment"); // kelas buat teks komentar
    komentar.textContent = ulasan.text; // isi teksnya sesuai komentar ulasan
    card.appendChild(komentar); // pasang komentar ke kartu

    return card; // kasih balik kartu yang udah lengkap
}

function tampilkanUlasan(daftarUlasan) { // fungsi buat nampilin semua kartu ulasan ke halaman
    // ambil semua elemen dengan class ini, bukan cuma yang pertama
    const semuaContainer = document.querySelectorAll(".review-container"); // ambil semua wadah ulasan yang ada di halaman

    semuaContainer.forEach((container) => { // ulangi buat tiap wadah ulasan yang ketemu
        daftarUlasan.forEach((ulasan) => { // ulangi buat tiap data ulasan
            const card = buatKartuUlasan(ulasan); // buat elemen baru tiap container
            container.appendChild(card); // pasang kartu ke wadah ulasan
        });
    });

}

document.getElementById("btn-hamburger").addEventListener("click", () => { // pasang aksi buat tombol menu hamburger
    document.getElementById("nav-menu").classList.toggle("aktif"); // buka/tutup menu navigasi pas tombol diklik
});

async function main() { // fungsi utama, isinya semua yang perlu dijalanin pas halaman dibuka
    const daftarUlasan = await ambilUlasan(); // ambil data ulasan dari api dulu, tunggu sampai selesai
    tampilkanUlasan(daftarUlasan); // tampilin semua ulasan ke halaman
}

main(); // jalankan fungsi utama begitu file ini dimuat