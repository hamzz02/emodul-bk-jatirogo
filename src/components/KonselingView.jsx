import { useState } from 'react';
import { ChevronLeft, CheckCircle2, RotateCcw, Save, Users } from 'lucide-react';
import { supabase } from '../supabase';
import { useToast } from '../hooks/useToast';

export default function KonselingView({ user, progress, setProgress }) {
  const [activeRPL, setActiveRPL] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Storage key khusus per siswa agar draf tidak tertukar
  const draftKey1 = `emodul_draft_rpl1_${user.nama}`;
  const draftKey2 = `emodul_draft_rpl2_${user.nama}`;
  const draftKey3 = `emodul_draft_rpl3_${user.nama}`;

  // Inisialisasi draf dari localStorage menggunakan lazy initializer
  const [rpl1Data, setRpl1Data] = useState(() => {
    try {
      const saved = localStorage.getItem(draftKey1);
      return saved ? JSON.parse(saved) : { q1: '', q2: '' };
    } catch {
      return { q1: '', q2: '' };
    }
  });

  const [rpl2Data, setRpl2Data] = useState(() => {
    try {
      const saved = localStorage.getItem(draftKey2);
      return saved ? JSON.parse(saved) : { q1: '' };
    } catch {
      return { q1: '' };
    }
  });

  const [rpl3Data, setRpl3Data] = useState(() => {
    try {
      const saved = localStorage.getItem(draftKey3);
      return saved ? JSON.parse(saved) : { q1: '' };
    } catch {
      return { q1: '' };
    }
  });

  // Simpan draf otomatis ke localStorage
  const handleRpl1Change = (field, value) => {
    const updated = { ...rpl1Data, [field]: value };
    setRpl1Data(updated);
    try {
      localStorage.setItem(draftKey1, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleRpl2Change = (value) => {
    const updated = { q1: value };
    setRpl2Data(updated);
    try {
      localStorage.setItem(draftKey2, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleRpl3Change = (value) => {
    const updated = { q1: value };
    setRpl3Data(updated);
    try {
      localStorage.setItem(draftKey3, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  // Fungsi simpan data ke Supabase
  const saveRPL = async (rplId, dataPayload) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...dataPayload,
        userId: user.nama,
        userClass: user.kelas,
        rpl: rplId,
      };

      const { error } = await supabase.from('konseling_rpl').insert([payload]);
      if (error) throw error;

      // Hapus draf lokal karena sudah sukses terkirim ke server
      if (rplId === 'rpl1') localStorage.removeItem(draftKey1);
      if (rplId === 'rpl2') localStorage.removeItem(draftKey2);
      if (rplId === 'rpl3') localStorage.removeItem(draftKey3);

      setProgress((prev) => ({ ...prev, [rplId]: true }));
      setActiveRPL(null);
      showToast(`Kegiatan ${rplId.toUpperCase()} berhasil disimpan ke database!`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Gagal menyimpan data: ' + (error.message || 'Periksa koneksi'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-800">Layanan Konseling Kelompok</h2>
          <p className="text-sm text-gray-500 mt-1">
            Selesaikan 3 Rencana Pelaksanaan Layanan (RPL) untuk melatih kesadaran diri secara bertahap.
          </p>
        </div>
        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl hidden sm:block">
          <Users size={28} />
        </div>
      </div>

      {!activeRPL ? (
        <div className="space-y-4">
          <RPLCard
            title="RPL 1: Aku dan Diriku"
            desc="Mengenali potensi diri, kelebihan pribadi, dan hal yang ingin diperbaiki."
            bobot="30%"
            done={progress.rpl1}
            onClick={() => setActiveRPL('rpl1')}
          />
          <RPLCard
            title="RPL 2: Mengenali Emosi & Pemicu Membolos"
            desc="Menganalisis situasi emosional atau pengaruh teman yang memicu membolos."
            bobot="30%"
            done={progress.rpl2}
            onClick={() => setActiveRPL('rpl2')}
          />
          <RPLCard
            title="RPL 3: Komitmen & Rencana Perubahan"
            desc="Menyusun target kehadiran dan langkah nyata yang dapat dievaluasi."
            bobot="40%"
            done={progress.rpl3}
            onClick={() => setActiveRPL('rpl3')}
          />
        </div>
      ) : (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <button
              onClick={() => setActiveRPL(null)}
              className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1.5"
            >
              <ChevronLeft size={18} /> Kembali ke Daftar RPL
            </button>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Save size={13} className="text-emerald-500" /> Draf otomatis disimpan di perangkat
            </span>
          </div>

          {/* FORM RPL 1 */}
          {activeRPL === 'rpl1' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveRPL('rpl1', { kelebihan: rpl1Data.q1, kelemahan: rpl1Data.q2 });
              }}
              className="space-y-6"
            >
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100 text-sm">
                <strong>Tujuan RPL 1:</strong> Membantu Anda mengenali kelebihan positif dalam diri untuk mengatasi kesulitan di sekolah.
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  1. Kekuatan / Kelebihan yang saya miliki:
                </label>
                <textarea
                  value={rpl1Data.q1}
                  onChange={(e) => handleRpl1Change('q1', e.target.value)}
                  placeholder="Contoh: Saya mudah bergaul, suka pelajaran praktik kejuruan, ingin membanggakan orang tua..."
                  required
                  rows="4"
                  className="w-full border rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base border-gray-200"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  2. Hal / Kebiasaan yang ingin saya perbaiki:
                </label>
                <textarea
                  value={rpl1Data.q2}
                  onChange={(e) => handleRpl1Change('q2', e.target.value)}
                  placeholder="Contoh: Sering begadang sehingga malas bangun pagi, sungkan menolak ajakan teman saat jam pelajaran..."
                  required
                  rows="4"
                  className="w-full border rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base border-gray-200"
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  <span>{isSubmitting ? 'Menyimpan ke Supabase...' : 'Simpan & Selesaikan RPL 1'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset isian draf formulir ini?')) {
                      setRpl1Data({ q1: '', q2: '' });
                      localStorage.removeItem(draftKey1);
                    }
                  }}
                  className="px-4 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={16} /> Reset
                </button>
              </div>
            </form>
          )}

          {/* FORM RPL 2 */}
          {activeRPL === 'rpl2' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveRPL('rpl2', { pemicu: rpl2Data.q1 });
              }}
              className="space-y-6"
            >
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100 text-sm">
                <strong>Tujuan RPL 2:</strong> Mengidentifikasi situasi, emosi, atau pemicu sosial yang sering memancing keinginan membolos.
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ceritakan situasi apa yang paling sering memicu Anda untuk membolos (misal: mata pelajaran tertentu, ajakan teman, masalah pribadi):
                </label>
                <textarea
                  value={rpl2Data.q1}
                  onChange={(e) => handleRpl2Change(e.target.value)}
                  placeholder="Ceritakan dengan jujur situasi apa yang Anda rasakan dan hadapi..."
                  required
                  rows="5"
                  className="w-full border rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base border-gray-200"
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  <span>{isSubmitting ? 'Menyimpan ke Supabase...' : 'Simpan & Selesaikan RPL 2'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset isian draf formulir ini?')) {
                      setRpl2Data({ q1: '' });
                      localStorage.removeItem(draftKey2);
                    }
                  }}
                  className="px-4 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={16} /> Reset
                </button>
              </div>
            </form>
          )}

          {/* FORM RPL 3 */}
          {activeRPL === 'rpl3' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveRPL('rpl3', { komitmen: rpl3Data.q1 });
              }}
              className="space-y-6"
            >
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100 text-sm">
                <strong>Tujuan RPL 3:</strong> Menetapkan komitmen pribadi yang nyata untuk hadir penuh di kelas dan bertindak asertif.
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Apa rencana aksi nyata dan komitmen Anda untuk mencegah membolos di sekolah mulai hari ini?
                </label>
                <textarea
                  value={rpl3Data.q1}
                  onChange={(e) => handleRpl3Change(e.target.value)}
                  placeholder="Contoh: Saya berkomitmen menolak ajakan teman nongkrong saat jam pelajaran, meminta bantuan Guru BK jika jenuh..."
                  required
                  rows="5"
                  className="w-full border rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base border-gray-200"
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  <span>{isSubmitting ? 'Menyimpan ke Supabase...' : 'Simpan & Selesaikan RPL 3'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset isian draf formulir ini?')) {
                      setRpl3Data({ q1: '' });
                      localStorage.removeItem(draftKey3);
                    }
                  }}
                  className="px-4 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={16} /> Reset
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function RPLCard({ title, desc, bobot, done, onClick }) {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row justify-between md:items-center gap-4 ${
        done
          ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
          : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-md'
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-gray-800 text-base md:text-lg">{title}</h4>
          <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
            Bobot {bobot}
          </span>
        </div>
        <p className="text-xs md:text-sm text-gray-500 max-w-xl">{desc}</p>
      </div>

      <div className="shrink-0">
        {done ? (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200">
            <CheckCircle2 size={16} /> Sudah Selesai
          </span>
        ) : (
          <button
            onClick={onClick}
            className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-bold transition shadow-sm"
          >
            Buka Kegiatan
          </button>
        )}
      </div>
    </div>
  );
}
