import { useState } from 'react';
import {
  BookOpen,
  Users,
  Brain,
  ClipboardCheck,
  UserCircle,
  BookText,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

import { supabase, isSupabaseConfigured } from './supabase';
import { ToastProvider } from './components/Toast';
import { useToast } from './hooks/useToast';

import DashboardView from './components/DashboardView';
import MateriView from './components/MateriView';
import KonselingView from './components/KonselingView';
import RefleksiView from './components/RefleksiView';
import EvaluasiView from './components/EvaluasiView';
import ProfilView from './components/ProfilView';
import AdminView from './components/AdminView';

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}

function MainApp() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [progress, setProgress] = useState({ rpl1: false, rpl2: false, rpl3: false });
  const [submissionStatus, setSubmissionStatus] = useState({ refleksi: false, evaluasi: false, skorEvaluasi: null });

  const { showToast } = useToast();

  // Kredensial admin (bisa dikustomisasi via environment variable di .env)
  const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'Admin';
  const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'admin123';

  const handleLogin = async (e) => {
    e.preventDefault();
    const nama = e.target.nama.value.trim();
    const kelas = e.target.kelas.value.trim();

    // Verifikasi Akun Admin
    if (nama === ADMIN_USER && kelas === ADMIN_PASS) {
      setIsAdmin(true);
      setUser({ nama: 'Administrator BK', kelas: 'Guru BK' });
      setCurrentView('admin');
      showToast('Selamat datang di Panel Admin Guru BK!', 'success');
      return;
    }

    setUser({ nama, kelas });
    setCurrentView('dashboard');
    showToast(`Halo ${nama}, selamat belajar di E-Modul BK!`, 'info');

    // Ambil riwayat progres tersimpan dari Supabase
    if (isSupabaseConfigured) {
      try {
        const [rplRes, refRes, evalRes] = await Promise.all([
          supabase.from('konseling_rpl').select('rpl').eq('userId', nama).eq('userClass', kelas),
          supabase.from('refleksi').select('id').eq('userId', nama).eq('userClass', kelas).limit(1),
          supabase.from('evaluasi').select('id, skor').eq('userId', nama).eq('userClass', kelas).order('created_at', { ascending: false }).limit(1)
        ]);

        if (rplRes.data && rplRes.data.length > 0) {
          const newProg = { rpl1: false, rpl2: false, rpl3: false };
          rplRes.data.forEach((item) => {
            if (item.rpl && Object.prototype.hasOwnProperty.call(newProg, item.rpl)) {
              newProg[item.rpl] = true;
            }
          });
          setProgress(newProg);
        }

        const hasRef = Boolean(refRes.data && refRes.data.length > 0);
        const hasEval = Boolean(evalRes.data && evalRes.data.length > 0);
        const score = hasEval ? evalRes.data[0].skor : null;

        setSubmissionStatus({
          refleksi: hasRef,
          evaluasi: hasEval,
          skorEvaluasi: score
        });
      } catch (err) {
        console.warn('Gagal memuat progres siswa sebelumnya:', err);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setCurrentView('login');
    setProgress({ rpl1: false, rpl2: false, rpl3: false });
    setSubmissionStatus({ refleksi: false, evaluasi: false, skorEvaluasi: null });
    showToast('Anda telah keluar dari aplikasi.', 'info');
  };

  const navigateTo = (view) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl w-full max-w-md border border-white">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-2xl mb-3 shadow-inner">
              <BookOpen size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">E-MODUL BK</h1>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mt-1">SMKN JATIROGO</p>
            <p className="text-xs text-gray-500 mt-0.5">Mengenal Diri, Melangkah Maju</p>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Konfigurasi Supabase Diperlukan:</strong>
                <p className="mt-0.5">Isi <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> pada file <code>.env</code>.</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                name="nama"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
                placeholder="Masukkan nama lengkap siswa..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Kelas / Jurusan</label>
              <input
                type="text"
                name="kelas"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
                placeholder="Contoh: XI TKJ 1"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-500/20 text-sm mt-2"
            >
              Masuk ke E-Modul
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      {/* HEADER MOBILE */}
      <div className="md:hidden bg-blue-600 text-white p-4 flex justify-between items-center z-20 shadow-md">
        <div className="flex items-center gap-2">
          <BookOpen size={20} />
          <h1 className="font-extrabold text-base">E-Modul BK Jatirogo</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 focus:outline-none">
          {isSidebarOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* OVERLAY MOBILE */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition duration-300 ease-in-out z-30 w-64 bg-blue-700 text-white flex flex-col h-full shadow-2xl md:shadow-none`}
      >
        <div className="p-5 border-b border-blue-600/70 mt-14 md:mt-0 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-200">
            <Sparkles size={14} /> SMKN JATIROGO
          </div>
          <h2 className="text-lg font-black tracking-tight">{user.nama}</h2>
          <span className="text-xs text-blue-200 bg-blue-800/60 px-2 py-0.5 rounded-md w-fit">
            {user.kelas}
          </span>
        </div>

        <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {isAdmin ? (
            <MenuButton
              icon={<ShieldAlert size={18} />}
              label="Dashboard Admin"
              active={currentView === 'admin'}
              onClick={() => navigateTo('admin')}
            />
          ) : (
            <>
              <MenuButton
                icon={<BookOpen size={18} />}
                label="Dashboard Utama"
                active={currentView === 'dashboard'}
                onClick={() => navigateTo('dashboard')}
              />
              <MenuButton
                icon={<BookText size={18} />}
                label="Materi E-Book"
                active={currentView === 'materi'}
                onClick={() => navigateTo('materi')}
              />
              <MenuButton
                icon={<Users size={18} />}
                label="Konseling Kelompok"
                active={currentView === 'konseling'}
                onClick={() => navigateTo('konseling')}
              />
              <MenuButton
                icon={<Brain size={18} />}
                label="Refleksi Diri"
                active={currentView === 'refleksi'}
                onClick={() => navigateTo('refleksi')}
              />
              <MenuButton
                icon={<ClipboardCheck size={18} />}
                label="Uji Evaluasi"
                active={currentView === 'evaluasi'}
                onClick={() => navigateTo('evaluasi')}
              />
              <MenuButton
                icon={<UserCircle size={18} />}
                label="Profil & Hasil"
                active={currentView === 'profil'}
                onClick={() => navigateTo('profil')}
              />
            </>
          )}
        </div>

        <div className="p-3 border-t border-blue-600/70">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 p-2.5 rounded-xl transition font-semibold text-xs text-blue-100"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        {currentView === 'dashboard' && (
          <DashboardView
            setView={navigateTo}
            user={user}
            progress={progress}
            submissionStatus={submissionStatus}
          />
        )}
        {currentView === 'materi' && <MateriView />}
        {currentView === 'konseling' && (
          <KonselingView user={user} progress={progress} setProgress={setProgress} />
        )}
        {currentView === 'refleksi' && (
          <RefleksiView
            user={user}
            submissionStatus={submissionStatus}
            setSubmissionStatus={setSubmissionStatus}
          />
        )}
        {currentView === 'evaluasi' && (
          <EvaluasiView
            user={user}
            submissionStatus={submissionStatus}
            setSubmissionStatus={setSubmissionStatus}
          />
        )}
        {currentView === 'profil' && (
          <ProfilView user={user} progress={progress} submissionStatus={submissionStatus} />
        )}
        {currentView === 'admin' && <AdminView />}
      </div>
    </div>
  );
}

function MenuButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl transition text-xs md:text-sm font-semibold ${
        active
          ? 'bg-white text-blue-700 shadow-md'
          : 'text-blue-100 hover:bg-blue-800/70 hover:text-white'
      }`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}
