//variabel global untuk nampung data
let tangkaiTerpilih = []; // menyimpan objek tangkai bunga yang udah diklik user
let dataTangkai = []; // menyimpan elemen <img> tangkai yang sudah masuk ke canvas
let inputTangkai = []; // menyimpan semua elemen <img> opsi tangkai di panel (buat enable/disable)
let wrapIdTerpilih = null; // menyimpan id wrap yang dipilih, buat generate link nanti
let daftarToken = []; // token dari API, dipakai buat validasi redeem

//pengambilan data dari API
async function ambilDataKomponen() {
    const res = await fetch("https://6a8b036755d899aede9b947c.mockapi.io/api/data"); // request GET ke endpoint MockAPI
    const data = await res.json(); // ubah respon jadi objek JS
    return {
        daftarTangkai: data?.[0]?.tangkai_bunga ?? [], // list tangkai bunga, kalau data g ada akan default array kosong
        daftarWrap: data?.[0]?.wrap ?? [], // list pilihan wrap/pembungkus bunga
        daftarTokenDiambil: data?.[0]?.images?.tokens ?? [] // list token redeem yang tersedia
    };
}

//render opsi tangkai bunga yg mau dipilih
function tampilkanOpsiTangkai(daftarTangkai) {
    const container = document.getElementById("pilih-tangkai"); // panel pilihan tempat opsi tangkai ditaruh

    daftarTangkai.forEach((tangkai) => { // loop tiap jenis tangkai dari API
        const klik = document.createElement("img"); // buat elemen img baru
        klik.classList.add("klik-tangkai"); // tambah class ke opsi tangkai
        klik.src = tangkai.gambar; // sumber gambar dari data API
        klik.alt = tangkai.nama; // alt text

        klik.addEventListener("click", () => tambahTangkai(tangkai)); // kalo klik, bakal nambahin tangkai dipilih ke buket

        container.appendChild(klik); // pasang elemen ke DOM
        inputTangkai.push(klik); // simpan referensinya buat dipakai di jumlahBunga()
    });
}

//posisi rangkaian tangkai bunga di buket(dgn koordinat)
const posisiTangkai = [ //jarak horizontal kiri<kanan
    { x: 50, y: 25 }, { x: 43, y: 30, rotate: -20 }, { x: 57, y: 30, rotate: 20 },
    { x: 50, y: 35 }, { x: 40, y: 40, rotate: -25 }, { x: 60, y: 40, rotate: 25 },
    { x: 50, y: 45 }, { x: 43, y: 50, rotate: -20 }, { x: 57, y: 50, rotate: 20 },
];

//inputan tangkai ke buket
function tambahTangkai(tangkai) {
    if (tangkaiTerpilih.length >= 9) { // batas maksimal 9 tangkai
        return; // stop kalau buket penuh
    }

    const posisi = posisiTangkai[tangkaiTerpilih.length]; // ambil koordinat sesuai urutan slot berikutnya
    const sudutRotasi = posisi.rotate ?? 0; //default 0 kalo gada data

    const img = document.createElement("img"); // buat elemen img tangkai baru di canvas
    img.classList.add("tangkai-di-buket"); // class buat posisi absolute di canvas
    img.src = tangkai.gambar; // gambar tangkai yang dipilih
    img.alt = tangkai.nama; // alt text
    img.style.left = posisi.x + "%"; // posisi horizontal sesuai koordinat
    img.style.top = posisi.y + "%"; // posisi vertikal sesuai koordinat
    img.style.zIndex = tangkaiTerpilih.length + 1; // urutan tumpukan biar tangkai belakangan tampil di atas
    img.style.transform = `translate(-50%, -50%) rotate(${sudutRotasi}deg)`; // geser ke tengah titik + rotasi

    document.getElementById("tangkai-bunga").appendChild(img); // pasang tangkai ke canvas

    tangkaiTerpilih.push(tangkai); // catat data tangkai yang dipilih
    dataTangkai.push(img); // catat elemen img-nya (buat di-undo nanti)

    jumlahBunga(); // update penghitung & status disabled(gabisa klik bunga lagi)
}

//untuk undo tangkai yang dipilih
function undoTangkai() {
    if (tangkaiTerpilih.length === 0) { //kalo gaada ada apa apa buat di-undo
        return;
    }

    const elemenTerakhir = dataTangkai.pop(); // ambil & hapus elemen img terakhir dari array
    elemenTerakhir.remove(); // hapus dari DOM juga
    tangkaiTerpilih.pop(); // hapus data tangkai terakhir juga

    jumlahBunga(); // update penghitung & status disabled lg
}

//update penghitung + enable/disable semua opsi klik bunga
function jumlahBunga() {
    const jumlah = tangkaiTerpilih.length; // menghitung sudah berapa tangkai yg dipilih

    const indikator = document.getElementById("hitung-tangkai"); // elemen teks hitung
    indikator.textContent = jumlah + "/9"; // tampilkan angka progress

    const sudahPenuh = jumlah >= 9; // kalau sudah mencapai batas maksimal

    inputTangkai.forEach((klik) => { // loop semua opsi tangkai di panel
        klik.classList.toggle("klik-disabled", sudahPenuh); // nyalakan/matikan tampilan disabled sesuai status penuh
    });
}

//pilih wrap yg mau dipake
function pilihWrap(wrap) {
    document.getElementById("wrap-depan").src = wrap.gambar_depan; // ganti gambar wrap depan di canvas
    document.getElementById("wrap-belakang").src = wrap.gambar_belakang; // ganti gambar wrap belakang di canvas
    wrapIdTerpilih = wrap.id; // id wrap jg disimpan buat generate link nanti
}

//untuk nampilin panel pilihan wrap maupun tangkai
const btnWrap = document.getElementById("btn-wrap"); // tombol buka panel wrap
const btnTangkai = document.getElementById("btn-tangkai"); // tombol buka panel tangkai
const panelWrap = document.getElementById("pilih-wrap"); // panel pilihan wrap
const panelTangkai = document.getElementById("pilih-tangkai"); // panel pilihan tangkai

btnWrap.addEventListener("click", () => {
    panelWrap.classList.add("aktif"); // tampilkan panel wrap
    panelTangkai.classList.remove("aktif"); // sembunyikan panel tangkai
});

btnTangkai.addEventListener("click", () => {
    panelTangkai.classList.add("aktif"); // tampilkan panel tangkai
    panelWrap.classList.remove("aktif"); // sembunyikan panel wrap, intinya gantian
});

//render opsi wrap di panel
function tampilkanPilihanWrap(daftarWrap) {
    const container = document.getElementById("pilih-wrap"); // panelnya tempat opsi wrap ditaruh

    daftarWrap.forEach((wrap) => { // loop tiap pilihan wrap dari API
        const klik = document.createElement("img"); // buat elemen img baru
        klik.classList.add("klik-wrap"); // tambah class buat opsi wrap
        klik.src = wrap.gambar_depan; // preview gambar wrap
        klik.alt = wrap.warna; // alt text

        klik.addEventListener("click", () => pilihWrap(wrap)); // klik wrap ini

        container.appendChild(klik); // pasang elemen ke DOM
    });
}

//share link/ generate link berdasarkan id yg disimpan tadi
function buatLinkBuket(pesan, pengirim) {
    const idTangkaiUrut = tangkaiTerpilih.map((t) => t.id).join(","); // gabung semua id tangkai jadi "1,3,2"
    const pesanTerenkode = encodeURIComponent(pesan); // encode pesan biar aman dipakai di URL
    const pengirimTerenkode = encodeURIComponent(pengirim); // encode nama pengirim biar aman di URL

    return new URL(`receiver.html?wrap=${wrapIdTerpilih}&tangkai=${idTangkaiUrut}&pesan=${pesanTerenkode}&dari=${pengirimTerenkode}`, window.location.href).href; // rakit URL kartu ucapan
}

// nampilkan popup kartu ucapan
function bukaPopupBuket() {
    if (wrapIdTerpilih === null) { // validasi: wrap wajib dipilih dulu
        alert("Pilih wrap untuk membungkus buket.");
        return;
    }

    if (tangkaiTerpilih.length === 0) { // validasi: minimal 1 tangkai bunga
        alert("Tambahkan minimal 1 tangkai bunga yaa.");
        return;
    }

    document.getElementById("popup-pesan-buket").value = ""; // reset input pesan tiap kali popup dibuka
    document.getElementById("popup-pengirim-buket").value = ""; // reset input nama pengirim

    document.getElementById("popup-overlay-buket").classList.add("aktif"); // tampilkan popup
}

//tutup popupnya
function tutupPopupBuket() {
    document.getElementById("popup-overlay-buket").classList.remove("aktif"); // sembunyikan popup
}

//salin URL yg udh di generate
function salinLinkBuket() {
    const pesanInput = document.getElementById("popup-pesan-buket"); // ambil elemen input pesan
    const pengirimInput = document.getElementById("popup-pengirim-buket"); // ambil elemen input nama pengirim

    const link = buatLinkBuket(pesanInput.value, pengirimInput.value); // generate link lengkap
    navigator.clipboard.writeText(link); // salin ke clipboard perangkat
    alert("Link disalin!"); // kasih pemberitahuan ke user
}

//validasi token
function cekTokenBuket() {
    const tokenInput = document.getElementById("popup-token"); // ambil elemen input token
    const token = tokenInput.value.trim().toUpperCase(); // normalisasi input (hilangkan spasi, jadi uppercase)

    if (token === "") { // validasi: input tidak boleh kosong
        alert("Masukkan token terlebih dahulu.");
        return;
    }

    const tokenDitemukan = daftarToken.find((t) => t.token.toUpperCase() === token); // cari token yang cocok di daftar API

    if (!tokenDitemukan) { // kalau tokennya nggak ketemu di daftar
        alert("Token tidak ditemukan.");
        return;
    }

    if (tokenDitemukan.status !== "available") { // token sudah pernah dipakai orang lain, meskipun di API bakal true trs
        alert("Token ini sudah pernah dipakai.");
        return;
    }

    window.location.href = "redeem.html"; // token valid, lanjut ke halaman redeem
}

//inisialisasi
async function main() {
    let daftarTangkai = []; // nilai default kalau fetch gagal, biar kode di bawah tetap aman jalan
    let daftarWrap = []; // sama, default kosong

    try {
        const hasil = await ambilDataKomponen(); // ambil semua data dari API sekali di awal
        daftarTangkai = hasil.daftarTangkai;
        daftarWrap = hasil.daftarWrap;
        daftarToken = hasil.daftarTokenDiambil; // simpan token ke variabel global tadi buat dipakai cekTokenBuket()
    } catch { // kalau fetch gagal (koneksi bermasalah, server nggak bisa diakses, dll)
        alert("Gagal memuat data tangkai/wrap dari server, coba muat ulang halaman."); // kasih tau user kenapa panelnya kosong
    }

    tampilkanOpsiTangkai(daftarTangkai); // render panel pilihan tangkai
    tampilkanPilihanWrap(daftarWrap); // render panel pilihan wrap

    jumlahBunga(); // set tampilan hitung 0/9

    const btnUndo = document.getElementById("btn-undo"); // tombol undo
    btnUndo.addEventListener("click", undoTangkai); // pasang event listener ke undo
    document.getElementById("btn-next").addEventListener("click", bukaPopupBuket); // tombol next buka popup konfirmasi
    document.getElementById("btn-tutup-popup-buket").addEventListener("click", tutupPopupBuket); // tombol tutup popup
    document.getElementById("btn-salin-link-buket").addEventListener("click", salinLinkBuket); // tombol salin link
    document.getElementById("btn-redeem-token").addEventListener("click", cekTokenBuket); // tombol cek token redeem
}

main(); // panggil main