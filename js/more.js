const iconCaraKerja = [ // daftar ikon sesuai urutan langkah cara kerja
    "deceased",
    "confirmation_number",
    "redeem",
    "featured_seasonal_and_gifts"
];

fetch('https://6a8b036755d899aede9b947c.mockapi.io/api/data') // minta data ke alamat api
    .then(res => res.json()) // ubah balesan server jadi bentuk objek javascript
    .then(response => {
        const data = response[0]; // ambil objek data utama dari hasil fetch

        // about us
        document.getElementById('about-desc').textContent = data.about_us.deskripsi; // isi deskripsi about us

        // how it works
        const caraKerjaContainer = document.getElementById('cara-kerja'); // ambil elemen tempat langkah-langkah ditaruh
        data.about_us.cara_kerja.forEach((step, index) => { // ulangi buat tiap langkah cara kerja
            const p = document.createElement('p'); // bikin baris baru buat satu langkah

            const icon = document.createElement('span'); // bikin elemen ikon
            icon.classList.add('material-symbols-outlined'); // kelas bawaan buat ikon material symbols
            icon.textContent = iconCaraKerja[index] || 'check_circle'; // pasang ikon sesuai urutan, kalau nggak ada pakai ikon default

            const teks = document.createTextNode(step); // bikin teks langkahnya

            p.appendChild(icon); // pasang ikon ke baris
            p.appendChild(teks); // pasang teks ke baris
            caraKerjaContainer.appendChild(p); // pasang baris ke container
        });

        // faq
        const faqContainer = document.getElementById('faq-list'); // ambil elemen tempat daftar faq ditaruh
        data.faq.forEach(item => { // ulangi buat tiap pertanyaan faq
            const details = document.createElement('details'); // bikin kotak faq yang bisa dibuka-tutup

            const summary = document.createElement('summary'); // bikin judul yang keliatan pas tertutup
            summary.textContent = item.pertanyaan; // isi judul dengan teks pertanyaan

            const jawaban = document.createElement('p'); // bikin elemen buat isi jawaban
            jawaban.textContent = item.jawaban; // isi teksnya dengan jawaban

            details.appendChild(summary); // pasang judul ke kotak faq
            details.appendChild(jawaban); // pasang jawaban ke kotak faq
            faqContainer.appendChild(details); // pasang kotak faq ke container
        });

        document.getElementById('btn-hamburger').addEventListener('click', () => { // pasang aksi buat tombol menu hamburger
            document.getElementById('nav-menu').classList.toggle('aktif'); // buka/tutup menu navigasi pas tombol diklik
        });
    })
    .catch(() => { // kalau fetch gagal (koneksi bermasalah, server nggak bisa diakses, dll)
        const pesanGagal = document.createElement('p'); // bikin elemen teks buat pesan gagal
        pesanGagal.textContent = 'Gagal memuat data, coba muat ulang halaman.'; // isi pesannya
        document.querySelector('main').prepend(pesanGagal); // taruh pesan di paling atas main
    });