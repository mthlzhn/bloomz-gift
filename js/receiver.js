// koordinat posisi tiap tangkai bunga di canvas
const posisiTangkai = [
    { x: 50, y: 25 }, { x: 43, y: 30, rotate: -20 }, { x: 57, y: 30, rotate: 20 },
    { x: 50, y: 35 }, { x: 40, y: 40, rotate: -25 }, { x: 60, y: 40, rotate: 25 },
    { x: 50, y: 45 }, { x: 43, y: 50, rotate: -20 }, { x: 57, y: 50, rotate: 20 },
];

//ambil data dari API
async function ambilDataKomponen() {
    const res = await fetch("https://6a8b036755d899aede9b947c.mockapi.io/api/data"); // request GET ke endpoint MockAPI
    const data = await res.json(); // ubah jadi objek JS
    return {
        daftarBuket: data?.[0]?.buket ?? [], // list buket katalog yg udh tersedia
        daftarTangkai: data?.[0]?.tangkai_bunga ?? [], // list tangkai bunga (buat buket rakitan)
        daftarWrap: data?.[0]?.wrap ?? [] // list pilihan wrap/pembungkus
    };
}

//baca parameter URL
function bacaParameterUrl() {
    const params = new URLSearchParams(window.location.search); // bawaan browser buat query string
    return {
        buketId: params.get("id"), // ada kalau link dari catalog.html (buket katalog)
        wrapId: params.get("wrap"), // ada kalau link dari create.html (buket rakitan)
        idTangkaiCsv: params.get("tangkai"), // daftar id tangkai, dipisah koma
        pesan: params.get("pesan") ?? "", // pesan ucapan, default string kosong
        dari: params.get("dari") ?? "" // nama pengirim, default string kosong
    };
}

//render buket katalog > link dari catalog.html, ?id=...
function renderBuketKatalog(buket) {
    document.getElementById("gambar-buket").classList.remove("tersembunyi"); // tampilkan elemen gambar buket

    document.getElementById("gambar-buket").src = buket.gambar; // pasang gambar buket yang dipesan
    document.getElementById("gambar-buket").alt = buket.nama; // alt text sesuai nama buket
}

//render buket rakitan custom > link dari create.html, ?wrap=...&tangkai=...
function renderBuketRakitan(wrap, daftarTangkaiTerpilih) {
    document.getElementById("mini-canvas").classList.remove("tersembunyi"); // tampilkan elemen canvas mini

    document.getElementById("wrap-belakang-r").src = wrap.gambar_belakang; // pasang lapisan wrap belakang
    document.getElementById("wrap-depan-r").src = wrap.gambar_depan; // pasang lapisan wrap depan

    const kontainerTangkai = document.getElementById("tangkai-bunga-r"); // wadah tempat tangkai-tangkai ditaruh

    //pakai for karena butuh index
    for (let index = 0; index < daftarTangkaiTerpilih.length; index++) {
        const tangkai = daftarTangkaiTerpilih[index]; // ambil data tangkai sesuai urutan
        const posisi = posisiTangkai[index]; // ambil koordinat sesuai urutan slot
        const sudutRotasi = posisi.rotate ?? 0; //default 0 kalau tidak diatur

        const img = document.createElement("img"); // buat elemen gambar tangkai baru
        img.classList.add("tangkai-di-buket");
        img.src = tangkai.gambar;
        img.alt = tangkai.nama;
        img.style.left = posisi.x + "%"; // posisi horizontal
        img.style.top = posisi.y + "%"; // posisi vertikal
        img.style.zIndex = index + 1; // urutan tumpukan biar tangkai belakangan tampil di atas
        img.style.transform = `translate(-50%, -50%) rotate(${sudutRotasi}deg)`; // geser ke titik tengah dan rotasi

        kontainerTangkai.appendChild(img); // pasang tangkai ke canvas
    }
}

//isi pesan
function isiPesan(pesan, dari) {
    const dariEl = document.getElementById("dari-pengirim"); // elemen teks buket dari ...
    dariEl.textContent = dari.trim() !== "" ? "Buket dari " + dari : ""; // kosong kalau nama pengirim tidak diisi

    const isiPesanEl = document.getElementById("isi-pesan"); // elemen teks pesan utama
    isiPesanEl.textContent = pesan === "" ? "Seseorang mengirimkan buket ini untukmu." : pesan; // pesan default kalau kosong
}

//handle error
function tampilkanPesanError() {
    const flipCard = document.getElementById("flip-card"); // kartu flip yang mau dihapus
    flipCard.remove(); // hapus dari DOM karena datanya tidak valid

    const pesanError = document.createElement("p"); // buat elemen pesan error baru
    pesanError.textContent = "Maaf, kartu ucapan ini tidak ditemukan atau link tidak valid.";
    document.querySelector("main").prepend(pesanError); // taruh di paling atas <main>
}

async function main() {
    const { buketId, wrapId, idTangkaiCsv, pesan, dari } = bacaParameterUrl(); // baca semua query params dari URL

    const adalahLinkKatalog = buketId !== null; // deteksi link 1 (buket katalog)
    const adalahLinkRakitan = wrapId !== null && idTangkaiCsv !== null; // deteksi link 2 (buket rakitan)

    if (!adalahLinkKatalog && !adalahLinkRakitan) { // link tidak cocok yg manapun
        tampilkanPesanError();
        return;
    }

    let daftarBuket, daftarTangkai, daftarWrap;

    try {
        ({ daftarBuket, daftarTangkai, daftarWrap } = await ambilDataKomponen()); // ambil data referensi dari API
    } catch { // kalau fetch/pengambilan data gagal (koneksi bermasalah, server nggak bisa diakses, dll)
        tampilkanPesanError(); // pakai pesan error yang sama, biar user nggak liat halaman kosong
        return; // hentikan fungsi, jangan lanjut render apapun
    }

    if (adalahLinkKatalog) { // proses skema buket katalog
        const buketDitemukan = daftarBuket.find((b) => String(b.id) === String(buketId)); // cari buket sesuai id di URL

        if (!buketDitemukan) { // id di URL tidak cocok data manapun
            tampilkanPesanError();
            return;
        }

        renderBuketKatalog(buketDitemukan); // render tampilan buket katalog
    } else { // proses buket rakitan
        const wrapDitemukan = daftarWrap.find((w) => String(w.id) === String(wrapId)); // cari wrap sesuai id di URL

        const idTangkaiArray = idTangkaiCsv.split(","); // pecah string yg koma koma td jadi array id
        const daftarTangkaiTerpilih = idTangkaiArray
            .map((id) => daftarTangkai.find((t) => String(t.id) === String(id))) // cocokkan tiap id ke data tangkai
            .filter((t) => t !== undefined); // buang yang g ketemu

        if (!wrapDitemukan || daftarTangkaiTerpilih.length === 0) { // data tidak lengkap/valid
            tampilkanPesanError();
            return;
        }

        renderBuketRakitan(wrapDitemukan, daftarTangkaiTerpilih); // render tampilan buket rakitan
    }

    isiPesan(pesan, dari); // isi pesan & nama pengirim di kartu

    const flipCard = document.getElementById("flip-card"); // kartu ucapan yang bisa dibalik
    flipCard.addEventListener("click", () => { // klik kartu buat lihat sisi belakang (pesan)
        flipCard.classList.toggle("terbalik");
    });
}

main(); // manggil kode diatas