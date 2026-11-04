import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { BookOpen, Users, Brain, ClipboardCheck, UserCircle, BookText, ChevronLeft, ChevronRight, LogOut, ShieldAlert, Menu, X } from 'lucide-react';

import { db } from './firebase';
import { eBookPages } from './dataMateri';
import AdminView from './components/AdminView';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State untuk Menu HP
  
  const [progress, setProgress] = useState({ rpl1: false, rpl2: false, rpl3: false });
  const [submissionStatus, setSubmissionStatus] = useState({ refleksi: false, evaluasi: false, skorEvaluasi: null });

  const handleLogin = (e) => {
    e.preventDefault();
    const nama = e.target.nama.value;
    const kelas = e.target.kelas.value;
    
    if (nama === 'Admin' && kelas === 'admin123') {
      setIsAdmin(true); setUser({ nama: 'Administrator', kelas: 'Admin' }); setCurrentView('admin');
    } else {
      setUser({ nama, kelas }); setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null); setIsAdmin(false); setCurrentView('login');
    setProgress({ rpl1: false, rpl2: false, rpl3: false });
    setSubmissionStatus({ refleksi: false, evaluasi: false, skorEvaluasi: null });
  };

  const navigateTo = (view) => {
    setCurrentView(view);
    setIsSidebarOpen(false); // Tutup sidebar setelah klik menu di HP
  }

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
              <input type="text" name="nama" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan nama..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas / Jurusan</label>
              <input type="text" name="kelas" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: XI TKJ 1" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium">Masuk</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      {/* HEADER KHUSUS HP (Tampil Hamburger Menu) */}
      <div className="md:hidden bg-blue-600 text-white p-4 flex justify-between items-center z-20 shadow-md">
        <h1 className="font-bold text-lg">E-Modul BK</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="focus:outline-none">
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* OVERLAY HP (Bg gelap saat menu terbuka) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* SIDEBAR RESPONSIVE */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-300 ease-in-out z-30 w-64 bg-blue-600 text-white flex flex-col h-full shadow-xl md:shadow-none`}>
        <div className="p-4 md:p-6 text-center border-b border-blue-500 mt-14 md:mt-0">
          <h2 className="text-xl font-bold hidden md:block">E-Modul BK</h2>
          <p className="text-sm text-blue-200 mt-1">{user.nama}</p>
          <p className="text-xs text-blue-200">{user.kelas}</p>
        </div>
        <div className="flex-1 p-4 space-y-2 overflow-y-auto flex flex-col gap-2 no-scrollbar">
          {isAdmin ? (
            <MenuButton icon={<ShieldAlert />} label="Dashboard Admin" active={currentView === 'admin'} onClick={() => navigateTo('admin')} />
          ) : (
            <>
              <MenuButton icon={<BookOpen />} label="Dashboard Utama" active={currentView === 'dashboard'} onClick={() => navigateTo('dashboard')} />
              <MenuButton icon={<BookText />} label="Materi E-Book" active={currentView === 'materi'} onClick={() => navigateTo('materi')} />
              <MenuButton icon={<Users />} label="Konseling Kelompok" active={currentView === 'konseling'} onClick={() => navigateTo('konseling')} />
              <MenuButton icon={<Brain />} label="Refleksi Diri" active={currentView === 'refleksi'} onClick={() => navigateTo('refleksi')} />
              <MenuButton icon={<ClipboardCheck />} label="Evaluasi" active={currentView === 'evaluasi'} onClick={() => navigateTo('evaluasi')} />
              <MenuButton icon={<UserCircle />} label="Profil & Progres" active={currentView === 'profil'} onClick={() => navigateTo('profil')} />
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
      <div className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        {currentView === 'dashboard' && <DashboardView setView={navigateTo} user={user} />}
        {currentView === 'materi' && <MateriView />}
        {currentView === 'konseling' && <KonselingView user={user} progress={progress} setProgress={setProgress} />}
        {currentView === 'refleksi' && <RefleksiView user={user} submissionStatus={submissionStatus} setSubmissionStatus={setSubmissionStatus} />}
        {currentView === 'evaluasi' && <EvaluasiView user={user} submissionStatus={submissionStatus} setSubmissionStatus={setSubmissionStatus} />}
        {currentView === 'profil' && <ProfilView user={user} progress={progress} submissionStatus={submissionStatus} />}
        {currentView === 'admin' && <AdminView />}
      </div>
    </div>
  );
}

// ---------------- Komponen ----------------
function MenuButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors whitespace-nowrap md:whitespace-normal ${active ? 'bg-blue-800 shadow-inner' : 'hover:bg-blue-700'}`}>
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
    <div className="max-w-4xl mx-auto pb-10">
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
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg flex flex-col h-[80vh] mb-10">
      <div className="p-4 border-b bg-blue-50 flex flex-col md:flex-row md:justify-between items-center rounded-t-xl gap-2 text-center md:text-left">
        <h2 className="font-bold text-blue-800 text-sm md:text-base">Mengenal Diri, Melangkah Maju</h2>
        <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Hal. {page + 1} / 17</span>
      </div>
      <div className="flex-1 p-6 md:p-8 overflow-y-auto whitespace-pre-wrap text-gray-800 leading-relaxed text-sm md:text-lg">
        <h3 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">{eBookPages[page].title}</h3>
        {eBookPages[page].content}
      </div>
      <div className="p-4 border-t flex justify-between items-center bg-gray-50 rounded-b-xl">
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 flex gap-2 items-center text-sm md:text-base"><ChevronLeft size={16}/> <span className="hidden md:inline">Sebelumn</span></button>
        <button onClick={() => setPage(p => Math.min(16, p + 1))} disabled={page === 16} className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 flex gap-2 items-center text-sm md:text-base"><span className="hidden md:inline">Selanjut</span> <ChevronRight size={16}/></button>
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
    } catch (error) { alert('Error menyimpan data'); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Tahapan Konseling Kelompok</h2>
      {!activeRPL ? (
        <div className="space-y-4">
          <RPLCard title="RPL 1: Aku dan Diriku" bobot="30%" done={progress.rpl1} onClick={() => setActiveRPL('rpl1')} />
          <RPLCard title="RPL 2: Mengenali Emosi & Pemicu" bobot="30%" done={progress.rpl2} onClick={() => setActiveRPL('rpl2')} />
          <RPLCard title="RPL 3: Komitmen Perubahan" bobot="40%" done={progress.rpl3} onClick={() => setActiveRPL('rpl3')} />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow">
          <button onClick={() => setActiveRPL(null)} className="mb-4 text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"><ChevronLeft size={16}/> Kembali</button>
          
          {activeRPL === 'rpl1' && (
            <form onSubmit={(e) => { e.preventDefault(); saveRPL('rpl1', { kelebihan: e.target.q1.value, kelemahan: e.target.q2.value }); }}>
              <h3 className="text-xl font-bold mb-4">RPL 1 - Peta Diriku</h3>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Kekuatan / Kelebihan yang saya miliki:</label><textarea name="q1" required className="w-full border rounded p-2 outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea></div>
                <div><label className="block text-sm font-medium mb-1">Hal yang ingin saya perbaiki:</label><textarea name="q2" required className="w-full border rounded p-2 outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea></div>
                <button type="submit" className="w-full md:w-auto bg-green-600 hover:bg-green-700 transition text-white px-6 py-2 rounded">Selesai & Simpan RPL 1</button>
              </div>
            </form>
          )}

          {activeRPL === 'rpl2' && (
             <form onSubmit={(e) => { e.preventDefault(); saveRPL('rpl2', { pemicu: e.target.q1.value }); }}>
               <h3 className="text-xl font-bold mb-4">RPL 2 - Pemicu Membolos</h3>
               <textarea name="q1" placeholder="Ceritakan situasi yang memicu..." required className="w-full border rounded p-2 outline-none focus:ring-2 focus:ring-blue-500 mb-4" rows="3"></textarea>
               <button type="submit" className="w-full md:w-auto bg-green-600 hover:bg-green-700 transition text-white px-6 py-2 rounded">Selesai & Simpan RPL 2</button>
             </form>
          )}

          {activeRPL === 'rpl3' && (
             <form onSubmit={(e) => { e.preventDefault(); saveRPL('rpl3', { komitmen: e.target.q1.value }); }}>
               <h3 className="text-xl font-bold mb-4">RPL 3 - Komitmen</h3>
               <textarea name="q1" placeholder="Apa rencana aksimu selanjutnya..." required className="w-full border rounded p-2 outline-none focus:ring-2 focus:ring-blue-500 mb-4" rows="3"></textarea>
               <button type="submit" className="w-full md:w-auto bg-green-600 hover:bg-green-700 transition text-white px-6 py-2 rounded">Selesai & Simpan RPL 3</button>
             </form>
          )}
        </div>
      )}
    </div>
  );
}

function RPLCard({ title, bobot, done, onClick }) {
  return (
    <div className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between md:items-center bg-white shadow-sm transition-all gap-3 ${done ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:shadow-md'}`}>
      <div><h4 className="font-bold text-gray-800">{title}</h4><p className="text-sm text-gray-500">Bobot Progres: {bobot}</p></div>
      {done ? <span className="text-green-600 font-bold px-3 py-1 rounded-full border border-green-200 bg-white self-start md:self-auto text-sm">✓ Selesai</span> : <button onClick={onClick} className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 font-medium transition-colors text-sm w-full md:w-auto">Buka Kegiatan</button>}
    </div>
  );
}

function RefleksiView({ user, submissionStatus, setSubmissionStatus }) {
  const [answers, setAnswers] = useState({ q1: '', q2: '' });
  const isDone = submissionStatus.refleksi;

  const submitRefleksi = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'refleksi'), { ...answers, userId: user.nama, userClass: user.kelas, timestamp: serverTimestamp() });
      setSubmissionStatus(prev => ({ ...prev, refleksi: true }));
    } catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow mb-10">
      <h2 className="text-2xl font-bold mb-6 border-b pb-4 text-gray-800">Refleksi Diri</h2>
      <form onSubmit={submitRefleksi} className="space-y-6">
        <div><label className="block mb-2 font-medium text-gray-700 text-sm md:text-base">1. Apa yang biasanya kamu rasakan sebelum memutuskan untuk membolos?</label><textarea required value={answers.q1} onChange={(e) => setAnswers({...answers, q1: e.target.value})} disabled={isDone} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" rows="3"></textarea></div>
        <div><label className="block mb-2 font-medium text-gray-700 text-sm md:text-base">2. Menurutmu, apa dampak perilaku tersebut bagi dirimu?</label><textarea required value={answers.q2} onChange={(e) => setAnswers({...answers, q2: e.target.value})} disabled={isDone} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" rows="3"></textarea></div>
        <button type="submit" disabled={isDone} className={`w-full py-3 rounded-lg font-bold transition-colors ${isDone ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>{isDone ? '✓ Refleksi Telah Terkirim' : 'Kirim Refleksi'}</button>
      </form>
    </div>
  );
}

function EvaluasiView({ user, submissionStatus, setSubmissionStatus }) {
  const [jawaban, setJawaban] = useState({});
  const isDone = submissionStatus.evaluasi;
  const daftarPertanyaan = [
    { id: 1, pertanyaan: "Kesadaran diri (self awareness) adalah kemampuan siswa untuk ....", opsi: ["A. Mengikuti semua ajakan teman agar dianggap kompak", "B. Mengenali dan memahami pikiran, perasaan, serta perilaku diri sendiri", "C. Menghindari tanggung jawab ketika menghadapi pelajaran yang sulit", "D. Menyembunyikan perasaan cemas dengan cara tidak masuk sekolah"], jawabanBenar: "B. Mengenali dan memahami pikiran, perasaan, serta perilaku diri sendiri" },
    { id: 2, pertanyaan: "Contoh tindakan siswa yang mampu mengenali emosinya secara tepat adalah ....", opsi: ["A. Mengabaikan rasa cemas lalu pergi meninggalkan kelas", "B. Menyadari dan menyebutkan bahwa dirinya sedang merasa bosan atau kecewa", "C. Menyalahkan teman ketika nilai pelajaran menurun", "D. Berpura-pura tidak peduli terhadap tugas sekolah"], jawabanBenar: "B. Menyadari dan menyebutkan bahwa dirinya sedang merasa bosan atau kecewa" },
    { id: 3, pertanyaan: "Ketika merasa kesulitan memahami materi pelajaran di kelas, tindakan yang paling bertanggung jawab adalah ....", opsi: ["A. Membolos pada jam pelajaran tersebut", "B. Mengajak teman sebangku keluar kelas menuju kantin", "C. Mencatat bagian yang sulit dan meminta penjelasan kepada guru atau teman", "D. Menghindari pengumpulan tugas"], jawabanBenar: "C. Mencatat bagian yang sulit dan meminta penjelasan kepada guru atau teman" },
    { id: 4, pertanyaan: "Salah satu faktor dari lingkungan yang sering berkaitan dengan munculnya perilaku membolos adalah ....", opsi: ["A. Ajakan teman sebaya untuk keluar sekolah saat jam pelajaran", "B. Kemampuan mengenali emosi diri", "C. Kebiasaan menyusun target belajar harian", "D. Keberanian meminta bantuan kepada Guru BK"], jawabanBenar: "A. Ajakan teman sebaya untuk keluar sekolah saat jam pelajaran" },
    { id: 5, pertanyaan: "Saat merasa malas atau enggan berangkat ke sekolah, langkah tepat agar tetap bertanggung jawab adalah ....", opsi: ["A. Langsung membolos karena mengikuti perasaan tidak nyaman", "B. Mencari alasan yang dibuat-buat agar diizinkan tidak masuk", "C. Memeriksa penyebab rasa malas tersebut dan berbicara dengan Guru BK atau orang tua", "D. Mengikuti tekanan teman untuk nongkrong di luar sekolah"], jawabanBenar: "C. Memeriksa penyebab rasa malas tersebut dan berbicara dengan Guru BK atau orang tua" },
    { id: 6, pertanyaan: "Sebelum mengambil keputusan untuk bertindak di sekolah, sebaiknya siswa ....", opsi: ["A. Bertindak terburu-buru sesuai dorongan sesaat", "B. Mempertimbangkan berbagai pilihan tindakan beserta akibatnya bagi diri sendiri dan orang lain", "C. Selalu menuruti kata teman agar tidak dijauhi", "D. Mengabaikan tata tertib sekolah"], jawabanBenar: "B. Mempertimbangkan berbagai pilihan tindakan beserta akibatnya bagi diri sendiri dan orang lain" },
    { id: 7, pertanyaan: "Apabila siswa menghadapi masalah pribadi yang membuat konsentrasi belajarnya terganggu, langkah terbaik yang dapat dilakukan adalah ....", opsi: ["A. Menyimpan semua masalah sendiri dan berhenti masuk sekolah", "B. Mencari bantuan kepada orang dewasa tepercaya seperti Guru BK, wali kelas, atau orang tua", "C. Melampiaskan masalah dengan membolos bersama teman", "D. Menyalahkan keadaan sekitar"], jawabanBenar: "B. Mencari bantuan kepada orang dewasa tepercaya seperti Guru BK, wali kelas, atau orang tua" },
    { id: 8, pertanyaan: "Manfaat utama melakukan refleksi diri bagi siswa adalah ....", opsi: ["A. Memahami pengalaman diri secara jujur untuk menentukan langkah perbaikan perilaku", "B. Membandingkan diri dengan orang lain untuk merendahkan diri sendiri", "C. Mencari-cari kesalahan teman atau guru", "D. Menghindari konsekuensi dari aturan sekolah"], jawabanBenar: "A. Memahami pengalaman diri secara jujur untuk menentukan langkah perbaikan perilaku" },
    { id: 9, pertanyaan: "Respons yang tegas dan sopan ketika diajak teman membolos pada jam pelajaran adalah ....", opsi: ["A. Mengejek teman di depan kelas", "B. Ikut membolos karena merasa tidak enak hati", "C. Mengatakan dengan sopan bahwa dirinya memilih tetap di kelas agar tidak tertinggal pelajaran", "D. Membuat keributan di dalam kelas"], jawabanBenar: "C. Mengatakan dengan sopan bahwa dirinya memilih tetap di kelas agar tidak tertinggal pelajaran" },
    { id: 10, pertanyaan: "Target perubahan perilaku yang baik dalam Rencana Aksi Pribadi sebaiknya bersifat ....", opsi: ["A. Terlalu besar dan sulit dilakukan", "B. Realistis, jelas langkahnya, dan dapat dievaluasi kemajuannya", "C. Sekadar meniru rencana milik teman", "D. Tidak memiliki batas waktu pelaksanaan"], jawabanBenar: "B. Realistis, jelas langkahnya, dan dapat dievaluasi kemajuannya" }
  ];

  const submitEvaluasi = async (e) => {
    e.preventDefault();
    if (Object.keys(jawaban).length < 10) return alert("Harap jawab semua 10 pertanyaan sebelum mengirim.");
    let hitungSkor = 0;
    daftarPertanyaan.forEach(item => { if (jawaban[item.id] === item.jawabanBenar) hitungSkor += 10; });
    try {
      await addDoc(collection(db, 'evaluasi'), { jawaban, skor: hitungSkor, userId: user.nama, userClass: user.kelas, timestamp: serverTimestamp() });
      setSubmissionStatus(prev => ({ ...prev, evaluasi: true, skorEvaluasi: hitungSkor }));
    } catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow mb-10">
      <h2 className="text-2xl font-bold mb-6 border-b pb-4 text-gray-800">Uji Evaluasi Pemahaman</h2>
      <form onSubmit={submitEvaluasi} className="space-y-8">
        {daftarPertanyaan.map((item) => (
          <div key={item.id} className="mb-4">
            <p className="font-semibold text-gray-800 mb-3 text-sm md:text-lg">{item.id}. {item.pertanyaan}</p>
            <div className="space-y-3 pl-2 md:pl-4">
              {item.opsi.map((pilihan, idx) => (
                <label key={idx} className={`flex items-start space-x-3 ${isDone ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                  <input type="radio" name={`evaluasi-${item.id}`} value={pilihan} checked={jawaban[item.id] === pilihan} onChange={() => setJawaban({ ...jawaban, [item.id]: pilihan })} disabled={isDone} className="w-5 h-5 mt-1 text-orange-500 focus:ring-orange-500 shrink-0" />
                  <span className="text-gray-700 text-sm md:text-base leading-relaxed">{pilihan}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button type="submit" disabled={isDone} className={`w-full py-3 rounded-lg font-bold transition-colors ${isDone ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>{isDone ? '✓ Jawaban Evaluasi Telah Terkirim' : 'Kirim Jawaban'}</button>
      </form>
      {isDone && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 text-green-800 rounded-xl text-center shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-green-600">Nilai Evaluasi Anda</h3>
          <p className="text-4xl font-bold mb-1">{submissionStatus.skorEvaluasi} <span className="text-xl text-green-600 font-normal">/ 100</span></p>
        </div>
      )}
    </div>
  );
}

function ProfilView({ user, progress, submissionStatus }) {
  let totalProgress = 0;
  if (progress.rpl1) totalProgress += 30; if (progress.rpl2) totalProgress += 30; if (progress.rpl3) totalProgress += 40;
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="bg-white p-6 rounded-xl shadow text-center">
        <UserCircle size={64} className="mx-auto text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">{user.nama}</h2>
        <p className="text-gray-500">{user.kelas}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-800">Progres Pembelajaran</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-lg border ${submissionStatus.refleksi ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <p className="text-sm text-gray-500 font-medium">Refleksi Diri</p>
            <p className={`font-bold mt-1 ${submissionStatus.refleksi ? 'text-green-600' : 'text-gray-400'}`}>{submissionStatus.refleksi ? 'Selesai ✓' : 'Belum Dikerjakan'}</p>
          </div>
          <div className={`p-4 rounded-lg border ${submissionStatus.evaluasi ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <p className="text-sm text-gray-500 font-medium">Uji Evaluasi</p>
            <p className={`font-bold mt-1 ${submissionStatus.evaluasi ? 'text-green-600' : 'text-gray-400'}`}>{submissionStatus.evaluasi ? `Selesai (Skor: ${submissionStatus.skorEvaluasi})` : 'Belum Dikerjakan'}</p>
          </div>
        </div>
        <div className="mb-2 flex justify-between items-center text-sm font-bold text-gray-600"><span>Progres Konseling (RPL)</span><span>{totalProgress}%</span></div>
        <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden"><div className="bg-blue-500 h-6 flex items-center justify-end pr-2 text-white text-xs font-bold transition-all duration-500" style={{ width: `${totalProgress}%` }}>{totalProgress > 0 ? `${totalProgress}%` : ''}</div></div>
      </div>
    </div>
  );
}