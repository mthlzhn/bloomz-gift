let daftarBuket = []; // nyimpen daftar buket, awalnya kosong, nanti keisi pas data dari api dateng
let daftarToken = []; // nyimpen daftar token, ambil dari api juga, bukan ditulis manual

// ambil data
async function ambilBuket() {
    const res = await fetch("https://6a8b036755d899aede9b947c.mockapi.io/api/data"); // minta data ke alamat api, tunggu sampai selesai
    const data = await res.json(); // ubah balesan server jadi bentuk objek javascript
    daftarBuket = data?.[0]?.buket ?? []; // ambil daftar buket dari data, kalau nggak ada isi array kosong
    daftarToken = data?.[0]?.images?.tokens ?? []; // ambil daftar token dari data, kalau nggak ada isi array kosong
    return daftarBuket; // kasih balik daftar buket buat dipakai di tempat lain
}

// render kartu buket
function tampilkanBuket(daftarTampil) {
    const container = document.getElementById("container-buket"); // ambil elemen tempat kartu-kartu bakal ditaruh
    container.replaceChildren(); // kosongin dulu isinya sebelum diisi ulang

    if (daftarTampil.length === 0) { // kalau daftar buket yang mau ditampilin kosong
        const pesanKosong = document.createElement("p"); // bikin elemen teks baru
        pesanKosong.textContent = "Buket tidak ditemukan."; // isi teksnya dengan pesan "tidak ditemukan"
        container.appendChild(pesanKosong); // pasang teks itu ke dalam container
        return; // hentikan fungsi di sini, nggak usah lanjut ke bawah
    }

    daftarTampil.forEach((buket) => { // ulangi proses ini buat setiap buket di daftar
        const card = document.createElement("div"); // bikin kotak pembungkus kartu
        card.classList.add("card"); // kasih nama kelas "card" biar bisa distyle css
        card.addEventListener("click", () => popupBuket(buket)); // kalau kartu diklik, buka popup buket ini

        const img = document.createElement("img"); // bikin elemen gambar
        img.classList.add("card-img"); // kasih nama kelas buat gambar kartu
        img.src = buket.gambar; // pasang sumber gambar sesuai data buket
        img.alt = buket.nama; // teks alternatif gambar, buat aksesibilitas

        const span = document.createElement("span"); // bikin ikon hati (favorite) pakai elemen span
        span.classList.add("material-symbols-outlined"); // kelas bawaan buat ikon material symbols
        span.classList.add("favorite"); // kelas tambahan khusus buat ikon favorite
        span.textContent = "favorite"; // nama ikon yang mau ditampilin

        const judul = document.createElement("h3"); // bikin judul kartu pakai heading h3
        judul.classList.add("card-title"); // kelas buat judul kartu
        judul.textContent = buket.nama; // isi judul sesuai nama buket

        const komposisi = document.createElement("small"); // bikin teks kecil buat komposisi buket
        komposisi.classList.add("card-desc"); // kelas buat teks deskripsi kartu
        komposisi.textContent = "Isi buket: " + buket.komposisi; // isi teksnya, digabung sama label "isi buket"

        card.appendChild(img); // pasang gambar ke dalam kartu
        card.appendChild(span); // pasang ikon hati ke dalam kartu
        card.appendChild(judul); // pasang judul ke dalam kartu
        card.appendChild(komposisi); // pasang komposisi ke dalam kartu

        container.appendChild(card); // pasang kartu yang udah lengkap ke container utama
    });
}

// search
function cariBuket(kataKunci) {
    const kataKunciBersih = kataKunci.trim().toLowerCase(); // buang spasi di pinggir & ubah semua huruf jadi kecil

    if (kataKunciBersih === "") { // kalau kata kuncinya kosong
        tampilkanBuket(daftarBuket); // tampilin semua buket tanpa disaring
        return; // hentikan fungsi di sini
    }

    const hasil = daftarBuket.filter((buket) => // saring daftar buket, ambil yang namanya atau komposisinya cocok
        buket.nama.toLowerCase().includes(kataKunciBersih) ||
        buket.komposisi.toLowerCase().includes(kataKunciBersih)
    );

    tampilkanBuket(hasil); // tampilin hasil pencarian
}

// filter situasi
function filterBySituasi(situasiPilihan) {
    const hasil = daftarBuket.filter((buket) => // ambil buket yang daftar situasinya mengandung pilihan tadi
        buket.situasi.includes(situasiPilihan)
    );

    tampilkanBuket(hasil); // tampilin hasil yang udah disaring
}

// cek token (validasi dari data api, bukan hardcode)
function cekToken(tokenInput, buketId) {
    const token = tokenInput.trim().toUpperCase(); // buang spasi di pinggir & jadikan huruf besar semua

    if (token === "") { // kalau kolom token dibiarkan kosong
        alert("Masukkan token terlebih dahulu."); // kasih peringatan ke user
        return; // hentikan fungsi, jangan lanjut cek apapun
    }

    const tokenDitemukan = daftarToken.find((t) => t.token.toUpperCase() === token); // cari token yang cocok di daftar token dari api

    if (!tokenDitemukan) { // kalau tokennya nggak ketemu di daftar
        alert("Token tidak ditemukan."); // kasih tau user tokennya nggak ada
        return; // hentikan fungsi
    }

    if (tokenDitemukan.status !== "available") { // kalau token ketemu tapi statusnya bukan "available" (udah kepake)
        alert("Token ini sudah pernah dipakai."); // kasih tau user tokennya udah pernah dipakai
        return; // hentikan fungsi
    }

    window.location.href = `redeem.html?id=${buketId}&token=${token}`; // kalau semua pengecekan lolos, pindah ke halaman redeem sambil bawa id buket & token
}

// popup kartu ucapan
function popupBuket(buket) {
    const overlay = document.getElementById("popup-overlay-buket"); // ambil elemen overlay (latar belakang gelap popup)
    const pesanInput = document.getElementById("popup-pesan-buket"); // ambil kolom input pesan ucapan
    const pengirimInput = document.getElementById("popup-pengirim-buket"); // ambil kolom input nama pengirim
    const tokenInput = document.getElementById("popup-token"); // ambil kolom input token

    pesanInput.value = ""; // kosongin kolom pesan tiap kali popup dibuka
    pengirimInput.value = ""; // kosongin kolom nama pengirim juga
    tokenInput.value = ""; // kosongin kolom token juga

    overlay.classList.add("aktif"); // tampilin popup dengan nambahin kelas "aktif"

    document.getElementById("btn-salin-link-buket").onclick = () => { // pasang aksi buat tombol salin link
        const link = new URL(`receiver.html?id=${buket.id}&pesan=${encodeURIComponent(pesanInput.value)}&dari=${encodeURIComponent(pengirimInput.value)}`, window.location.href).href; 
        navigator.clipboard.writeText(link); // salin link itu ke clipboard user
        alert("Link disalin!"); // kasih tau user link udah kesalin
    };

    document.getElementById("btn-redeem-token").onclick = () => { // pasang aksi buat tombol redeem token
        cekToken(tokenInput.value, buket.id); // jalankan pengecekan token pas tombol diklik
    };
}

// nutup popup
function tutupPopup() {
    document.getElementById("popup-overlay-buket").classList.remove("aktif"); // hapus kelas "aktif" biar popup ilang
}

// fungsi utama
async function main() {
    try {
        await ambilBuket(); // ambil data buket dari api dulu, tunggu sampai selesai
        tampilkanBuket(daftarBuket); // tampilin semua buket ke halaman
    } catch { // kalau fetch gagal (koneksi bermasalah, server nggak bisa diakses, dll)
        const container = document.getElementById("container-buket"); // ambil elemen tempat kartu-kartu harusnya ditaruh
        const pesanGagal = document.createElement("p"); // bikin elemen teks buat pesan gagal
        pesanGagal.textContent = "Gagal memuat data buket, coba muat ulang halaman."; // isi pesannya, beda dari pesan 'tidak ditemukan'
        container.appendChild(pesanGagal); // pasang pesan gagal ke container
    }

    document.getElementById("btn-hamburger").addEventListener("click", () => { // pasang aksi buat tombol menu hamburger
        document.getElementById("nav-menu").classList.toggle("aktif"); // buka/tutup menu navigasi pas tombol diklik
    });

    const formCari = document.getElementById("form-cari"); // ambil elemen form pencarian
    const inputCari = document.getElementById("cari-buket"); // ambil kolom input pencarian

    formCari.addEventListener("submit", (event) => { // pasang aksi pas form pencarian disubmit
        event.preventDefault(); // cegah halaman reload otomatis (bawaan form)
        cariBuket(inputCari.value); // jalankan pencarian sesuai kata kunci yang diketik
    });

    const semuaTombolSituasi = document.querySelectorAll("#btn-situasi button"); // ambil semua tombol filter situasi

    semuaTombolSituasi.forEach((tombol) => { // pasang aksi klik buat tiap tombol situasi
        tombol.addEventListener("click", () => {
            const situasi = tombol.textContent.trim(); // ambil teks tombol yang diklik, buang spasi di pinggir

            if (situasi === "Semua") { // kalau tombolnya "semua"
                tampilkanBuket(daftarBuket); // tampilin semua buket tanpa disaring
            } else {
                filterBySituasi(situasi); // kalau bukan, saring sesuai situasi yang dipilih
            }
        });
    });

    document.getElementById("btn-tutup-popup-buket").addEventListener("click", tutupPopup); // pasang aksi buat tombol tutup popup

    document.getElementById("popup-overlay-buket").addEventListener("click", (event) => { // pasang aksi klik di area overlay (latar gelap popup)
        if (event.target.id === "popup-overlay-buket") { // kalau yang diklik beneran overlay-nya, bukan popup box-nya
            tutupPopup(); // tutup popup
        }
    });
}

main(); // jalankan fungsi utama begitu file ini dimuat