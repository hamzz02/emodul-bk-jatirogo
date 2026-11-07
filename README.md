# E-Modul Bimbingan dan Konseling (BK) SMKN Jatirogo

Aplikasi web interaktif e-modul BK berbasis layanan konseling kelompok untuk meningkatkan kesadaran diri pada siswa di SMKN Jatirogo (*Mengenal Diri, Melangkah Maju*).

---

## 🚀 Panduan Setup Database (Supabase)

Proyek ini telah dimigrasikan dari Firebase ke **Supabase** (PostgreSQL) agar dapat menampung kapasitas data siswa dalam jumlah besar tanpa batasan kuota harian dokumen Firestore.

### 1. Buat Proyek di Supabase
1. Kunjungi [Supabase Dashboard](https://supabase.com/dashboard) dan buat akun/proyek baru (misalnya dengan nama: `emodul-bk-jatirogo`).
2. Tentukan password database dan pilih region terdekat (misal: Singapore).

### 2. Eksekusi Skrip SQL Tabel
1. Pada navigasi kiri Supabase Dashboard, pilih menu **SQL Editor**.
2. Klik **New Query**.
3. Buka file [`supabase_schema.sql`](./supabase_schema.sql) pada repositori ini, salin seluruh isinya, lalu tempelkan ke SQL Editor Supabase.
4. Klik tombol **Run** (atau tekan `Ctrl + Enter`).
5. Skrip akan membuat 3 tabel utama (`refleksi`, `evaluasi`, `konseling_rpl`), index performa, serta kebijakan Row Level Security (RLS) otomatis.

### 3. Masukkan Kredensial ke `.env`
1. Di Supabase Dashboard, buka menu **Project Settings** (ikon gerigi) -> **API**.
2. Salin **Project URL** dan **Project API Keys (anon / public)**.
3. Buka file `.env` di proyek ini dan masukkan nilai tersebut:
   ```env
   VITE_SUPABASE_URL=https://proyek-anda.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
   ```

---

## 💻 Menjalankan Aplikasi Secara Lokal

1. **Install dependensi:**
   ```bash
   npm install
   ```

2. **Jalankan development server:**
   ```bash
   npm run dev
   ```

3. **Build untuk produksi:**
   ```bash
   npm run build
   ```

---

## 🔑 Hak Akses Pengguna

- **Siswa**:
  Masukkan Nama Lengkap dan Kelas (contoh: *Budi Santoso*, *XI TKJ 1*). Progres belajar dan hasil aktivitas akan otomatis tersimpan ke Supabase.
- **Guru BK (Admin)**:
  - **Nama Lengkap**: `Admin`
  - **Kelas**: `admin123`
  - Fitur admin: Melihat seluruh respons refleksi, evaluasi nilai siswa, progres RPL, pencarian & filter per kelas, serta **Export ke Excel (CSV)**.
