//js untuk handle redeem kode

function main() {
    const form = document.getElementById("form-redeem"); // ambil elemen form redeem

    form.addEventListener("submit", (event) => { // pasang listener submit
        event.preventDefault(); // agar form ga reload halaman sendiri
        alert("Pesanan berhasil diajukan!"); // kasih feedback ke user
        window.location.href = "../index.html"; // kembali ke home, biar ga isi form 2 kali
    });
}

main(); // manggil kode diatas