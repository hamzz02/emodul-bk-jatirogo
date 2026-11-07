import { BookText, Users, Brain, ClipboardCheck, UserCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function DashboardView({ setView, user, progress, submissionStatus }) {
  // Hitung total progres
  let rplProg = 0;
  if (progress.rpl1) rplProg += 30;
  if (progress.rpl2) rplProg += 30;
  if (progress.rpl3) rplProg += 40;

  const stepsCompleted = (submissionStatus.refleksi ? 1 : 0) + (submissionStatus.evaluasi ? 1 : 0) + (rplProg === 100 ? 1 : 0);
  const totalSteps = 3; // Refleksi, Evaluasi, RPL

  const menus = [
    {
      id: 'materi',
      label: 'Materi E-Book',
      desc: '17 halaman psikoedukasi mengenal diri & pencegahan membolos',
      icon: <BookText size={28} />,
      color: 'bg-indigo-600',
      tag: 'Modul Utama',
      status: 'Tersedia'
    },
    {
      id: 'konseling',
      label: 'Konseling Kelompok',
      desc: '3 tahapan RPL (Peta Diriku, Pemicu, & Komitmen Aksi)',
      icon: <Users size={28} />,
      color: 'bg-emerald-600',
      tag: '3 Tahapan',
      status: rplProg === 100 ? 'Selesai 100%' : `${rplProg}% Selesai`
    },
    {
      id: 'refleksi',
      label: 'Refleksi Diri',
      desc: 'Analisis jujur penyebab, perasaan, dan dampak perilaku membolos',
      icon: <Brain size={28} />,
      color: 'bg-purple-600',
      tag: 'Aktivitas',
      status: submissionStatus.refleksi ? 'Selesai ✓' : 'Belum Diisi'
    },
    {
      id: 'evaluasi',
      label: 'Uji Evaluasi',
      desc: '10 butir soal pilihan ganda pemahaman materi kesadaran diri',
      icon: <ClipboardCheck size={28} />,
      color: 'bg-orange-600',
      tag: 'Kuis 10 Soal',
      status: submissionStatus.evaluasi ? `Nilai: ${submissionStatus.skorEvaluasi}/100` : 'Belum Dikerjakan'
    },
    {
      id: 'profil',
      label: 'Hasil & Profil Siswa',
      desc: 'Rekapitulasi progres belajar Anda dan cetak lembar portofolio',
      icon: <UserCircle size={28} />,
      color: 'bg-blue-600',
      tag: 'Portofolio',
      status: 'Lihat Hasil'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* BANNER SAMBUTAN */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold mb-3">
            <Sparkles size={14} /> E-Modul Bimbingan & Konseling SMKN Jatirogo
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {user.nama}!
          </h1>
          <p className="text-blue-100 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Kelas: <strong className="text-white">{user.kelas}</strong>. Mari tingkatkan kesadaran diri untuk mengenali pikiran, emosi, dan melangkah maju mencapai cita-cita tanpa membolos.
          </p>

          {/* STATUS PENYELESAIAN SINGKAT */}
          <div className="mt-6 pt-5 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs md:text-sm">
            <div>
              <span className="text-blue-200">Aktivitas Selesai: </span>
              <strong className="text-white text-base font-bold">{stepsCompleted} dari {totalSteps} Kegiatan</strong>
            </div>
            <button
              onClick={() => setView('materi')}
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-5 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition shadow"
            >
              Mulai Belajar Sekarang <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Aksesoris Lingkaran Dekoratif */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* GRID MENU UTAMA */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Pilihan Kegiatan Pembelajaran</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menus.map((item) => (
            <div
              key={item.id}
              onClick={() => setView(item.id)}
              className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl text-white ${item.color} shadow-sm group-hover:scale-105 transition-transform`}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {item.label}
                </h3>
                <p className="text-gray-500 text-xs md:text-sm mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-medium">
                <span className={item.status.includes('Selesai') || item.status.includes('Nilai') ? 'text-emerald-600 font-semibold' : 'text-gray-500'}>
                  Status: {item.status}
                </span>
                <span className="text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-semibold">
                  Buka <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

