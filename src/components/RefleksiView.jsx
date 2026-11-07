import { useState } from 'react';
import { Brain, Save, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { supabase } from '../supabase';
import { useToast } from '../hooks/useToast';

export default function RefleksiView({ user, submissionStatus, setSubmissionStatus }) {
  const isDone = submissionStatus.refleksi;
  const { showToast } = useToast();
  const draftKey = `emodul_draft_refleksi_${user.nama}`;

  // Inisialisasi draf dari localStorage dengan lazy initializer
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      return saved ? JSON.parse(saved) : { q1: '', q2: '' };
    } catch {
      return { q1: '', q2: '' };
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    const updated = { ...answers, [field]: value };
    setAnswers(updated);
    if (!isDone) {
      try {
        localStorage.setItem(draftKey, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const submitRefleksi = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...answers,
        userId: user.nama,
        userClass: user.kelas,
      };

      const { error } = await supabase.from('refleksi').insert([payload]);
      if (error) throw error;

      localStorage.removeItem(draftKey);
      setSubmissionStatus((prev) => ({ ...prev, refleksi: true }));
      showToast('Refleksi diri Anda berhasil dikirim ke database!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengirim refleksi: ' + (err.message || 'Periksa koneksi database'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* HEADER REFLEKSI */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
            <Sparkles size={14} /> Aktivitas Kesadaran Diri
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-800">Lembar Refleksi Diri</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Jawablah dengan jujur sesuai pengalaman pribadi Anda. Jawaban Anda tersimpan rahasia bersama Guru BK.
          </p>
        </div>
        <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl hidden sm:block">
          <Brain size={28} />
        </div>
      </div>

      {isDone && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
          <div>
            <strong>Refleksi Diri Telah Diselesaikan!</strong>
            <p className="text-xs text-emerald-700 mt-0.5">Jawaban Anda sudah tercatat di sistem Guru BK. Terima kasih atas kejujuran dan komitmen Anda.</p>
          </div>
        </div>
      )}

      {/* FORM REFLEKSI */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={submitRefleksi} className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-800 text-sm md:text-base">
              1. Apa yang biasanya Anda rasakan atau pikirkan sebelum memutuskan untuk membolos?
            </label>
            <p className="text-xs text-gray-400 mb-2">Contoh: merasa bosan, cemas dengan ulangan, diajak teman, atau merasa pelajaran terlalu sulit.</p>
            <textarea
              required
              value={answers.q1}
              onChange={(e) => handleChange('q1', e.target.value)}
              disabled={isDone}
              placeholder="Tuliskan pengalaman dan perasaan Anda..."
              className="w-full border rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed border-gray-200 text-sm md:text-base"
              rows="4"
            ></textarea>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-800 text-sm md:text-base">
              2. Menurut Anda, apa dampak perilaku membolos tersebut bagi diri sendiri dan masa depan Anda?
            </label>
            <p className="text-xs text-gray-400 mb-2">Contoh: tertinggal materi kejuruan, tugas menumpuk, mengecewakan orang tua, dsb.</p>
            <textarea
              required
              value={answers.q2}
              onChange={(e) => handleChange('q2', e.target.value)}
              disabled={isDone}
              placeholder="Tuliskan analisis dampak yang Anda sadari..."
              className="w-full border rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed border-gray-200 text-sm md:text-base"
              rows="4"
            ></textarea>
          </div>

          {!isDone && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                <span>{isSubmitting ? 'Mengirim Refleksi...' : 'Kirim Refleksi ke Guru BK'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset draf refleksi ini?')) {
                    setAnswers({ q1: '', q2: '' });
                    localStorage.removeItem(draftKey);
                  }
                }}
                className="px-4 py-3.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
