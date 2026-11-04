import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { BookOpen, Users, Brain, ClipboardCheck, UserCircle, BookText, ChevronLeft, ChevronRight, LogOut, ShieldAlert } from 'lucide-react';

// ==========================================
// 1. SETUP FIREBASE
// GANTI ISI config DI BAWAH DENGAN MILIK ANDA
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyB330pmJkgFDz6_tdPczqdVL4NlR5ryApU",
  authDomain: "e-module-konseling.firebaseapp.com",
  projectId: "e-module-konseling",
  storageBucket: "e-module-konseling.firebasestorage.app",
  messagingSenderId: "887311935652",
  appId: "1:887311935652:web:8fa4a7a99e58b7c3bb1e31",
  measurementId: "G-P7Z2D9SK8N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// 2. DATA MATERI E-BOOK (Ringkasan 17 Halaman)
// ==========================================
const eBookPages = [
  { page: 1, title: "Sampul Depan", content: "E-MODUL BIMBINGAN DAN KONSELING\nPengembangan E-Modul Berbasis Layanan Konseling Kelompok...\n\nDisusun Oleh: Tim Penyusun / Peneliti\nTahun Ajaran 2026/2027" },
  { page: 2, title: "Identitas E-Modul", content: "Judul: Mengenal Diri, Melangkah Maju\nSasaran: Siswa SMKN Jatirogo\nBentuk: Digital Interaktif\nInstansi: Bimbingan dan Konseling SMKN Jatirogo" },
  { page: 3, title: "Kata Pengantar", content: "E-Modul ini disusun sebagai media pendamping layanan BK bagi siswa SMKN Jatirogo untuk membantu mengenali pikiran, perasaan, dan perilaku terkait membolos." },
  { page: 4, title: "Daftar Isi", content: "01 | Petunjuk Penggunaan\n02 | Pendahuluan\n03 | Bab 1: Mengenal Kesadaran Diri\n04 | Bab 2: Memahami Perilaku Membolos\n..." },
  { page: 5, title: "Petunjuk Penggunaan", content: "Kerjakan setiap aktivitas secara jujur. Kerahasiaan cerita anggota kelompok wajib dijaga. Gunakan sebagai media pendamping, bukan pengganti konseling langsung." },
  { page: 6, title: "Pendahuluan", content: "Latar Belakang: Masa SMK penuh tuntutan yang kadang memicu perilaku membolos. Kesadaran diri (self-awareness) penting untuk mengenali pemicunya." },
  { page: 7, title: "Bab 1: Kesadaran Diri", content: "Kesadaran diri adalah kemampuan mengenali emosi, pikiran, kekuatan, nilai hidup, dan pengaruh perilaku terhadap orang lain. Berani jujur melihat keadaan diri." },
  { page: 8, title: "Bab 2: Perilaku Membolos", content: "Faktor Internal: Kurang motivasi, cemas, bosan.\nFaktor Eksternal: Ajakan teman, masalah dengan guru.\nDampak: Tertinggal pelajaran, hubungan renggang." },
  { page: 9, title: "Bab 3: Alur Kesadaran", content: "Situasi -> Pikiran -> Perasaan -> Tindakan.\nGunakan teknik STOP & CHECK sebelum membolos. Berlatihlah menolak ajakan membolos secara asertif." },
  { page: 10, title: "Bab 4: Panduan Konseling", content: "Konseling kelompok membantu membahas masalah melalui dinamika kelompok. Terdapat 3 tahapan (RPL 1, RPL 2, RPL 3) untuk mencapai kesadaran utuh." },
  { page: 11, title: "Detail RPL", content: "RPL 1: Aku dan Diriku (30%)\nRPL 2: Mengenali Emosi & Pemicu (30%)\nRPL 3: Komitmen Perubahan (40%)" },
  { page: 12, title: "Bab 5: Aktivitas & Refleksi", content: "Peta Diriku: Mengenali kekuatan dan area pengembangan. Analisis situasi, pikiran, perasaan, dan tindakan saat menghadapi kesulitan di sekolah." },
  { page: 13, title: "Bab 6: Evaluasi", content: "Berisi soal pilihan ganda untuk mengukur pemahaman siswa tentang self-awareness dan perilaku membolos." },
  { page: 14, title: "Lembar Pemeriksaan Diri", content: "Refleksi mandiri tentang konsistensi mengenali emosi, menyadari akibat, dan keberanian mencari bantuan ke Guru BK." },
  { page: 15, title: "Bab 7: Jurnal 7 Hari", content: "Latihan harian memantau emosi, target belajar, mengatasi hambatan, dan evaluasi mingguan kehadiran di sekolah." },
  { page: 16, title: "Bab 8: Kesimpulan", content: "Kesadaran diri membantu mencegah membolos. Rekomendasi: Buat jadwal, kelola emosi, dan konsultasi ke Guru BK." },
  { page: 17, title: "Glosarium & Pustaka", content: "Glosarium: Emosi, Refleksi, Membolos.\nReferensi: Corey (2016), Goleman (1995), Prayitno (2004)." }
];

// ==========================================
// 3. KOMPONEN UTAMA APLIKASI
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [progress, setProgress] = useState({ rpl1: false, rpl2: false, rpl3: false });

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    const nama = e.target.nama.value;
    const kelas = e.target.kelas.value;
    
    if (nama === 'Admin' && kelas === 'admin123') {
      setIsAdmin(true);
      setUser({ nama: 'Administrator', kelas: 'Admin' });
      setCurrentView('admin');
    } else {
      setUser({ nama, kelas });
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setCurrentView('login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">E-MODUL BK</h1>
            <p className="text-gray-600">SMKN JATIROGO</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" name="nama" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Masukkan nama..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas / Jurusan</label>
              <input type="text" name="kelas" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Contoh: XI TKJ 1" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium">
              Masuk
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* SIDEBAR / NAVBAR */}
      <div className="w-full md:w-64 bg-blue-600 text-white flex flex-col">
        <div className="p-4 md:p-6 text-center border-b border-blue-500">
          <h2 className="text-xl font-bold">E-Modul BK</h2>
          <p className="text-sm text-blue-200 mt-1">{user.nama}</p>
          <p className="text-xs text-blue-200">{user.kelas}</p>
        </div>
        <div className="flex-1 p-4 space-y-2 overflow-y-auto flex md:flex-col gap-2 no-scrollbar">
          {isAdmin ? (
            <MenuButton icon={<ShieldAlert />} label="Dashboard Admin" active={currentView === 'admin'} onClick={() => setCurrentView('admin')} />
          ) : (
            <>
              <MenuButton icon={<BookOpen />} label="Dashboard Utama" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
              <MenuButton icon={<BookText />} label="Materi E-Book" active={currentView === 'materi'} onClick={() => setCurrentView('materi')} />
              <MenuButton icon={<Users />} label="Konseling Kelompok" active={currentView === 'konseling'} onClick={() => setCurrentView('konseling')} />
              <MenuButton icon={<Brain />} label="Refleksi Diri" active={currentView === 'refleksi'} onClick={() => setCurrentView('refleksi')} />
              <MenuButton icon={<ClipboardCheck />} label="Evaluasi" active={currentView === 'evaluasi'} onClick={() => setCurrentView('evaluasi')} />
              <MenuButton icon={<UserCircle />} label="Profil & Progres" active={currentView === 'profil'} onClick={() => setCurrentView('profil')} />
            </>
          )}
        </div>
        <div className="p-4 border-t border-blue-500">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 p-2 rounded-lg transition">
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {currentView === 'dashboard' && <DashboardView setView={setCurrentView} user={user} />}
        {currentView === 'materi' && <MateriView />}
        {currentView === 'konseling' && <KonselingView user={user} progress={progress} setProgress={setProgress} />}
        {currentView === 'refleksi' && <RefleksiView user={user} />}
        {currentView === 'evaluasi' && <EvaluasiView user={user} />}
        {currentView === 'profil' && <ProfilView user={user} progress={progress} />}
        {currentView === 'admin' && <AdminView />}
      </div>
    </div>
  );
}

// ==========================================
// VIEW COMPONENTS
// ==========================================

function MenuButton({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors whitespace-nowrap md:whitespace-normal ${active ? 'bg-blue-800 shadow-inner' : 'hover:bg-blue-700'}`}
    >
      {icon} <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function DashboardView({ setView, user }) {
  const menus = [
    { id: 'materi', label: 'Materi (E-Book)', icon: <BookText size={32}/>, color: 'bg-indigo-500' },
    { id: 'konseling', label: 'Konseling Kelompok', icon: <Users size={32}/>, color: 'bg-green-500' },
    { id: 'refleksi', label: 'Refleksi Diri', icon: <Brain size={32}/>, color: 'bg-purple-500' },
    { id: 'evaluasi', label: 'Uji Evaluasi', icon: <ClipboardCheck size={32}/>, color: 'bg-orange-500' },
    { id: 'profil', label: 'Hasil & Profil', icon: <UserCircle size={32}/>, color: 'bg-blue-500' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Halo, {user.nama}!</h1>
      <p className="text-gray-600 mb-8">Pilih menu di bawah ini untuk memulai pembelajaran dan aktivitas bimbingan konseling.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {menus.map(m => (
          <button key={m.id} onClick={() => setView(m.id)} className="bg-white p-6 rounded-xl shadow hover:shadow-md transition flex flex-col items-center gap-4 text-center border border-gray-100">
            <div className={`p-4 text-white rounded-full ${m.color}`}>{m.icon}</div>
            <span className="font-semibold text-gray-700">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MateriView() {
  const [page, setPage] = useState(0);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg flex flex-col h-[80vh]">
      <div className="p-4 border-b bg-blue-50 flex justify-between items-center rounded-t-xl">
        <h2 className="font-bold text-blue-800">E-Book: Mengenal Diri, Melangkah Maju</h2>
        <span className="text-sm font-medium text-blue-600">Halaman {page + 1} / 17</span>
      </div>
      <div className="flex-1 p-8 overflow-y-auto whitespace-pre-wrap text-gray-800 leading-relaxed text-lg">
        <h3 className="text-2xl font-bold mb-4">{eBookPages[page].title}</h3>
        {eBookPages[page].content}
      </div>
      <div className="p-4 border-t flex justify-between items-center bg-gray-50 rounded-b-xl">
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 flex gap-2 items-center">
          <ChevronLeft size={16}/> Sebelumnya
        </button>
        <button onClick={() => setPage(p => Math.min(16, p + 1))} disabled={page === 16} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 flex gap-2 items-center">
          Selanjutnya <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  );
}

function KonselingView({ user, progress, setProgress }) {
  const [activeRPL, setActiveRPL] = useState(null);

  const saveRPL = async (rplId, data) => {
    try {
      await addDoc(collection(db, 'konseling_rpl'), { ...data, userId: user.nama, userClass: user.kelas, rpl: rplId, timestamp: serverTimestamp() });
      setProgress({ ...progress, [rplId]: true });
      setActiveRPL(null);
      alert('Data RPL berhasil disimpan ke database!');
    } catch (error) {
      alert('Error menyimpan data: Pastikan Firebase sudah diatur.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Tahapan Konseling Kelompok</h2>
      
      {!activeRPL ? (
        <div className="space-y-4">
          <RPLCard title="RPL 1: Aku dan Diriku" bobot="30%" done={progress.rpl1} onClick={() => setActiveRPL('rpl1')} />
          <RPLCard title="RPL 2: Mengenali Emosi & Pemicu" bobot="30%" done={progress.rpl2} onClick={() => setActiveRPL('rpl2')} />
          <RPLCard title="RPL 3: Komitmen Perubahan" bobot="40%" done={progress.rpl3} onClick={() => setActiveRPL('rpl3')} />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow">
          <button onClick={() => setActiveRPL(null)} className="mb-4 text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
            <ChevronLeft size={16}/> Kembali
          </button>
          
          {activeRPL === 'rpl1' && (
            <form onSubmit={(e) => { e.preventDefault(); saveRPL('rpl1', { kelebihan: e.target.q1.value, kelemahan: e.target.q2.value }); }}>
              <h3 className="text-xl font-bold mb-4">RPL 1 - Peta Diriku</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kekuatan / Kelebihan yang saya miliki:</label>
                  <textarea name="q1" required className="w-full border rounded p-2" rows="3"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hal yang ingin saya perbaiki:</label>
                  <textarea name="q2" required className="w-full border rounded p-2" rows="3"></textarea>
                </div>
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Selesai & Simpan RPL 1</button>
              </div>
            </form>
          )}

          {/* Form RPL 2 & 3 disingkat untuk keterbacaan, strukturnya sama persis */}
          {activeRPL === 'rpl2' && (
             <form onSubmit={(e) => { e.preventDefault(); saveRPL('rpl2', { pemicu: e.target.q1.value }); }}>
               <h3 className="text-xl font-bold mb-4">RPL 2 - Pemicu Membolos</h3>
               <label className="block mb-1">Situasi yang sering memicu rasa ingin membolos:</label>
               <textarea name="q1" required className="w-full border rounded p-2 mb-4" rows="3"></textarea>
               <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Selesai & Simpan RPL 2</button>
             </form>
          )}

          {activeRPL === 'rpl3' && (
             <form onSubmit={(e) => { e.preventDefault(); saveRPL('rpl3', { komitmen: e.target.q1.value }); }}>
               <h3 className="text-xl font-bold mb-4">RPL 3 - Komitmen</h3>
               <label className="block mb-1">Tindakan perubahan yang akan saya lakukan mulai besok:</label>
               <textarea name="q1" required className="w-full border rounded p-2 mb-4" rows="3"></textarea>
               <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Selesai & Simpan RPL 3</button>
             </form>
          )}
        </div>
      )}
    </div>
  );
}

function RPLCard({ title, bobot, done, onClick }) {
  return (
    <div className={`p-4 rounded-xl border flex justify-between items-center bg-white shadow-sm ${done ? 'border-green-500' : 'border-gray-200'}`}>
      <div>
        <h4 className="font-bold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-500">Bobot Progres: {bobot}</p>
      </div>
      {done ? (
        <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-200">✓ Selesai</span>
      ) : (
        <button onClick={onClick} className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 font-medium">Buka Kegiatan</button>
      )}
    </div>
  );
}

function RefleksiView({ user }) {
  const submitRefleksi = async (e) => {
    e.preventDefault();
    const data = { q1: e.target.q1.value, q2: e.target.q2.value };
    try {
      await addDoc(collection(db, 'refleksi'), { ...data, userId: user.nama, userClass: user.kelas, timestamp: serverTimestamp() });
      e.target.reset();
      alert('Refleksi berhasil disimpan!');
    } catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">Refleksi Diri</h2>
      <form onSubmit={submitRefleksi} className="space-y-4">
        <div><label className="block mb-1">1. Apa yang biasanya kamu rasakan sebelum memutuskan untuk membolos?</label><textarea name="q1" required className="w-full border rounded p-2" rows="3"></textarea></div>
        <div><label className="block mb-1">2. Menurutmu, apa dampak perilaku tersebut bagi dirimu?</label><textarea name="q2" required className="w-full border rounded p-2" rows="3"></textarea></div>
        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold">Kirim Refleksi</button>
      </form>
    </div>
  );
}

function EvaluasiView({ user }) {
  const submitEvaluasi = async (e) => {
    e.preventDefault();
    const q1 = e.target.q1.value;
    const score = q1 === 'B' ? 100 : 0; // Contoh sederhana 1 soal dari 10
    
    try {
      await addDoc(collection(db, 'evaluasi'), { score, userId: user.nama, userClass: user.kelas, timestamp: serverTimestamp() });
      alert(`Evaluasi Selesai! Skor Anda: ${score}`);
    } catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">Uji Evaluasi Pemahaman</h2>
      <form onSubmit={submitEvaluasi} className="space-y-6">
        <div>
          <label className="block font-medium mb-2">1. Kesadaran diri (self awareness) adalah kemampuan siswa untuk ....</label>
          <div className="space-y-2 text-gray-700">
            <label className="block"><input type="radio" name="q1" value="A" required className="mr-2"/>A. Mengikuti semua ajakan teman</label>
            <label className="block"><input type="radio" name="q1" value="B" required className="mr-2"/>B. Mengenali dan memahami pikiran, perasaan diri sendiri</label>
            <label className="block"><input type="radio" name="q1" value="C" required className="mr-2"/>C. Menghindari tanggung jawab</label>
          </div>
        </div>
        <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold hover:bg-orange-600">Kirim Jawaban</button>
      </form>
    </div>
  );
}

function ProfilView({ user, progress }) {
  let totalProgress = 0;
  if (progress.rpl1) totalProgress += 30;
  if (progress.rpl2) totalProgress += 30;
  if (progress.rpl3) totalProgress += 40;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow text-center">
        <UserCircle size={64} className="mx-auto text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold">{user.nama}</h2>
        <p className="text-gray-500">{user.kelas}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-4 border-b pb-2">Progres Konseling Kelompok</h3>
        <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
          <div className="bg-blue-500 h-6 flex items-center justify-end pr-2 text-white text-xs font-bold transition-all" style={{ width: `${totalProgress}%` }}>
            {totalProgress}%
          </div>
        </div>
        {totalProgress === 100 && <p className="text-green-600 mt-4 font-bold text-center">Luar Biasa! Kamu telah menyelesaikan seluruh rangkaian.</p>}
      </div>
    </div>
  );
}

function AdminView() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "refleksi"));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(docs);
      } catch (e) {
        console.log("Error loading admin data");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-5xl mx-auto overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Dashboard Admin (Database Jawaban)</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border">Nama Siswa</th>
            <th className="p-3 border">Kelas</th>
            <th className="p-3 border">Jawaban Refleksi (Q1)</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (<tr><td colSpan="3" className="p-4 text-center">Belum ada data masuk.</td></tr>) : 
           data.map(row => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="p-3 border font-medium">{row.userId}</td>
              <td className="p-3 border">{row.userClass}</td>
              <td className="p-3 border">{row.q1}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}