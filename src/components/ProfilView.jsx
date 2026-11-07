import { UserCircle, Printer, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function ProfilView({ user, progress, submissionStatus }) {
  let totalRpl = 0;
  if (progress.rpl1) totalRpl += 30;
  if (progress.rpl2) totalRpl += 30;
  if (progress.rpl3) totalRpl += 40;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* KARTU PROFIL UTAMA */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <UserCircle size={56} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-1">
              <Sparkles size={12} /> Siswa SMKN Jatirogo
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800">{user.nama}</h2>
            <p className="text-sm font-medium text-gray-500">Kelas / Jurusan: {user.kelas}</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="print:hidden flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs md:text-sm font-semibold transition shadow-sm"
          title="Cetak lembar bukti portofolio ke kertas atau PDF"
        >
          <Printer size={16} />
          <span>Cetak Portofolio</span>
        </button>
      </div>

      {/* REKAPITULASI PROGRES BELAJAR */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Rekapitulasi Progres Bimbingan Konseling</h3>
          <p className="text-xs text-gray-500">Portofolio penyelesaian modul layanan konseling kelompok</p>
        </div>

        {/* PROGRESS BAR RPL */}
        <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex justify-between items-center text-xs md:text-sm font-bold text-gray-700">
            <span>Progres Layanan Konseling (RPL 1, 2, 3)</span>
            <span className="text-blue-600">{totalRpl}% Selesai</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${totalRpl}%` }}
            ></div>
          </div>
        </div>

        {/* GRID STATUS PENYELESAIAN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatusCard
            title="RPL 1: Aku dan Diriku"
            subtitle="Mengenali kelebihan & kekurangan"
            done={progress.rpl1}
            badge="Bobot 30%"
          />
          <StatusCard
            title="RPL 2: Mengenali Emosi"
            subtitle="Menganalisis pemicu membolos"
            done={progress.rpl2}
            badge="Bobot 30%"
          />
          <StatusCard
            title="RPL 3: Komitmen Perubahan"
            subtitle="Rencana aksi pribadi ke depan"
            done={progress.rpl3}
            badge="Bobot 40%"
          />
          <StatusCard
            title="Refleksi Diri"
            subtitle="Lembar analisis dampak membolos"
            done={submissionStatus.refleksi}
            badge="Aktivitas"
          />
        </div>

        {/* SKOR EVALUASI */}
        <div className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-800 text-sm md:text-base">Uji Evaluasi Pemahaman</h4>
            <p className="text-xs text-gray-500 mt-0.5">10 butir soal pemahaman kesadaran diri</p>
          </div>
          <div className="text-right">
            {submissionStatus.evaluasi ? (
              <span className="text-2xl font-black text-orange-600">
                {submissionStatus.skorEvaluasi} <span className="text-xs font-normal text-gray-500">/ 100</span>
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-200 text-gray-600 rounded-md">
                Belum Diuji
              </span>
            )}
          </div>
        </div>

        {/* AREA TANDA TANGAN (HANYA MUNCUL SAAT DICETAK) */}
        <div className="hidden print:grid grid-cols-2 gap-8 pt-12 mt-12 border-t text-center text-xs text-gray-700">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold mt-1">Guru Bimbingan dan Konseling</p>
            <div className="h-20"></div>
            <p className="font-semibold underline">....................................................</p>
            <p className="text-[10px] text-gray-500">NIP. ........................................</p>
          </div>
          <div>
            <p>Jatirogo, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold mt-1">Siswa Bersangkutan</p>
            <div className="h-20"></div>
            <p className="font-semibold underline">{user.nama}</p>
            <p className="text-[10px] text-gray-500">Kelas: {user.kelas}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, subtitle, done, badge }) {
  return (
    <div
      className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
        done ? 'bg-emerald-50/60 border-emerald-200' : 'bg-gray-50/60 border-gray-100'
      }`}
    >
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <h5 className="font-bold text-gray-800 text-sm">{title}</h5>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
            {badge}
          </span>
        </div>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      <div className="shrink-0 mt-0.5">
        {done ? (
          <CheckCircle2 size={18} className="text-emerald-600" />
        ) : (
          <Clock size={18} className="text-gray-400" />
        )}
      </div>
    </div>
  );
}

