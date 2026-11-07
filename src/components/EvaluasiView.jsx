import { useState } from 'react';
import { ClipboardCheck, Award, Send } from 'lucide-react';
import { supabase } from '../supabase';
import { useToast } from '../hooks/useToast';

export default function EvaluasiView({ user, submissionStatus, setSubmissionStatus }) {
  const [jawaban, setJawaban] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDone = submissionStatus.evaluasi;
  const { showToast } = useToast();

  const daftarPertanyaan = [
    {
      id: 1,
      pertanyaan: "Kesadaran diri (self awareness) adalah kemampuan siswa untuk ....",
      opsi: [
        "A. Mengikuti semua ajakan teman agar dianggap kompak",
        "B. Mengenali dan memahami pikiran, perasaan, serta perilaku diri sendiri",
        "C. Menghindari tanggung jawab ketika menghadapi pelajaran yang sulit",
        "D. Menyembunyikan perasaan cemas dengan cara tidak masuk sekolah"
      ],
      jawabanBenar: "B. Mengenali dan memahami pikiran, perasaan, serta perilaku diri sendiri"
    },
    {
      id: 2,
      pertanyaan: "Contoh tindakan siswa yang mampu mengenali emosinya secara tepat adalah ....",
      opsi: [
        "A. Mengabaikan rasa cemas lalu pergi meninggalkan kelas",
        "B. Menyadari dan menyebutkan bahwa dirinya sedang merasa bosan atau kecewa",
        "C. Menyalahkan teman ketika nilai pelajaran menurun",
        "D. Berpura-pura tidak peduli terhadap tugas sekolah"
      ],
      jawabanBenar: "B. Menyadari dan menyebutkan bahwa dirinya sedang merasa bosan atau kecewa"
    },
    {
      id: 3,
      pertanyaan: "Ketika merasa kesulitan memahami materi pelajaran di kelas, tindakan yang paling bertanggung jawab adalah ....",
      opsi: [
        "A. Membolos pada jam pelajaran tersebut",
        "B. Mengajak teman sebangku keluar kelas menuju kantin",
        "C. Mencatat bagian yang sulit dan meminta penjelasan kepada guru atau teman",
        "D. Menghindari pengumpulan tugas"
      ],
      jawabanBenar: "C. Mencatat bagian yang sulit dan meminta penjelasan kepada guru atau teman"
    },
    {
      id: 4,
      pertanyaan: "Salah satu faktor dari lingkungan yang sering berkaitan dengan munculnya perilaku membolos adalah ....",
      opsi: [
        "A. Ajakan teman sebaya untuk keluar sekolah saat jam pelajaran",
        "B. Kemampuan mengenali emosi diri",
        "C. Kebiasaan menyusun target belajar harian",
        "D. Keberanian meminta bantuan kepada Guru BK"
      ],
      jawabanBenar: "A. Ajakan teman sebaya untuk keluar sekolah saat jam pelajaran"
    },
    {
      id: 5,
      pertanyaan: "Saat merasa malas atau enggan berangkat ke sekolah, langkah tepat agar tetap bertanggung jawab adalah ....",
      opsi: [
        "A. Langsung membolos karena mengikuti perasaan tidak nyaman",
        "B. Mencari alasan yang dibuat-buat agar diizinkan tidak masuk",
        "C. Memeriksa penyebab rasa malas tersebut dan berbicara dengan Guru BK atau orang tua",
        "D. Mengikuti tekanan teman untuk nongkrong di luar sekolah"
      ],
      jawabanBenar: "C. Memeriksa penyebab rasa malas tersebut dan berbicara dengan Guru BK atau orang tua"
    },
    {
      id: 6,
      pertanyaan: "Sebelum mengambil keputusan untuk bertindak di sekolah, sebaiknya siswa ....",
      opsi: [
        "A. Bertindak terburu-buru sesuai dorongan sesaat",
        "B. Mempertimbangkan berbagai pilihan tindakan beserta akibatnya bagi diri sendiri dan orang lain",
        "C. Selalu menuruti kata teman agar tidak dijauhi",
        "D. Mengabaikan tata tertib sekolah"
      ],
      jawabanBenar: "B. Mempertimbangkan berbagai pilihan tindakan beserta akibatnya bagi diri sendiri dan orang lain"
    },
    {
      id: 7,
      pertanyaan: "Apabila siswa menghadapi masalah pribadi yang membuat konsentrasi belajarnya terganggu, langkah terbaik yang dapat dilakukan adalah ....",
      opsi: [
        "A. Menyimpan semua masalah sendiri dan berhenti masuk sekolah",
        "B. Mencari bantuan kepada orang dewasa tepercaya seperti Guru BK, wali kelas, atau orang tua",
        "C. Melampiaskan masalah dengan membolos bersama teman",
        "D. Menyalahkan keadaan sekitar"
      ],
      jawabanBenar: "B. Mencari bantuan kepada orang dewasa tepercaya seperti Guru BK, wali kelas, atau orang tua"
    },
    {
      id: 8,
      pertanyaan: "Manfaat utama melakukan refleksi diri bagi siswa adalah ....",
      opsi: [
        "A. Memahami pengalaman diri secara jujur untuk menentukan langkah perbaikan perilaku",
        "B. Membandingkan diri dengan orang lain untuk merendahkan diri sendiri",
        "C. Mencari-cari kesalahan teman atau guru",
        "D. Menghindari konsekuensi dari aturan sekolah"
      ],
      jawabanBenar: "A. Memahami pengalaman diri secara jujur untuk menentukan langkah perbaikan perilaku"
    },
    {
      id: 9,
      pertanyaan: "Respons yang tegas dan sopan ketika diajak teman membolos pada jam pelajaran adalah ....",
      opsi: [
        "A. Mengejek teman di depan kelas",
        "B. Ikut membolos karena merasa tidak enak hati",
        "C. Mengatakan dengan sopan bahwa dirinya memilih tetap di kelas agar tidak tertinggal pelajaran",
        "D. Membuat keributan di dalam kelas"
      ],
      jawabanBenar: "C. Mengatakan dengan sopan bahwa dirinya memilih tetap di kelas agar tidak tertinggal pelajaran"
    },
    {
      id: 10,
      pertanyaan: "Target perubahan perilaku yang baik dalam Rencana Aksi Pribadi sebaiknya bersifat ....",
      opsi: [
        "A. Terlalu besar dan sulit dilakukan",
        "B. Realistis, jelas langkahnya, dan dapat dievaluasi kemajuannya",
        "C. Sekadar meniru rencana milik teman",
        "D. Tidak memiliki batas waktu pelaksanaan"
      ],
      jawabanBenar: "B. Realistis, jelas langkahnya, dan dapat dievaluasi kemajuannya"
    }
  ];

  const totalAnswered = Object.keys(jawaban).length;
  const progressPercent = Math.round((totalAnswered / daftarPertanyaan.length) * 100);

  const submitEvaluasi = async (e) => {
    e.preventDefault();
    if (totalAnswered < daftarPertanyaan.length) {
      return showToast(`Harap jawab semua soal (${totalAnswered}/${daftarPertanyaan.length} dijawab)`, 'error');
    }

    let hitungSkor = 0;
    daftarPertanyaan.forEach((item) => {
      if (jawaban[item.id] === item.jawabanBenar) {
        hitungSkor += 10;
      }
    });

    setIsSubmitting(true);
    try {
      const payload = {
        jawaban,
        skor: hitungSkor,
        userId: user.nama,
        userClass: user.kelas,
      };

      const { error } = await supabase.from('evaluasi').insert([payload]);
      if (error) throw error;

      setSubmissionStatus((prev) => ({ ...prev, evaluasi: true, skorEvaluasi: hitungSkor }));
      showToast(`Evaluasi berhasil dikirim! Nilai Anda: ${hitungSkor}/100`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengirim evaluasi: ' + (err.message || 'Periksa koneksi'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-800">Uji Evaluasi Pemahaman</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Uji pemahaman materi e-modul kesadaran diri (10 soal pilihan ganda, nilai maksimal 100).
          </p>
        </div>
        <div className="p-3 bg-orange-100 text-orange-700 rounded-2xl hidden sm:block">
          <ClipboardCheck size={28} />
        </div>
      </div>

      {/* INDIKATOR SOAL TERJAWAB */}
      {!isDone && (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
            <span>Progres Pengerjaan Soal:</span>
            <span>{totalAnswered} dari {daftarPertanyaan.length} Terjawab ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* KARTU SKOR JIKA SUDAH SELESAI */}
      {isDone && (
        <div className="p-6 md:p-8 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl text-center shadow-sm space-y-3">
          <div className="inline-flex p-3 bg-orange-500 text-white rounded-2xl shadow-md">
            <Award size={36} />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-orange-700">Hasil Evaluasi Pemahaman Anda</h3>
          <p className="text-5xl font-black text-gray-800">
            {submissionStatus.skorEvaluasi} <span className="text-2xl font-normal text-gray-500">/ 100</span>
          </p>
          <p className="text-xs md:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            {submissionStatus.skorEvaluasi >= 80
              ? '🎉 Luar biasa! Anda memiliki pemahaman yang sangat mendalam mengenai kesadaran diri dan cara mencegah membolos.'
              : submissionStatus.skorEvaluasi >= 60
              ? '👍 Baik! Pemahaman Anda sudah cukup bagus, terus terapkan latihan refleksi dalam keseharian di sekolah.'
              : '💪 Tetap semangat! Silakan baca kembali materi E-Modul dan diskusikan bersama Guru BK.'}
          </p>
        </div>
      )}

      {/* DAFTAR SOAL */}
      <form onSubmit={submitEvaluasi} className="space-y-6">
        {daftarPertanyaan.map((item) => (
          <div
            key={item.id}
            className={`p-5 md:p-6 rounded-2xl border transition-all ${
              jawaban[item.id] ? 'bg-white border-blue-200 shadow-sm' : 'bg-white border-gray-100'
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 w-7 h-7 rounded-lg bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">
                {item.id}
              </span>
              <p className="font-semibold text-gray-800 text-sm md:text-base leading-relaxed">
                {item.pertanyaan}
              </p>
            </div>

            <div className="space-y-2.5 pl-2 md:pl-10">
              {item.opsi.map((pilihan, idx) => (
                <label
                  key={idx}
                  className={`flex items-start space-x-3 p-3 rounded-xl border transition cursor-pointer text-xs md:text-sm leading-relaxed ${
                    jawaban[item.id] === pilihan
                      ? 'bg-orange-50 border-orange-300 text-orange-950 font-medium'
                      : 'hover:bg-gray-50 border-gray-100 text-gray-700'
                  } ${isDone ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  <input
                    type="radio"
                    name={`evaluasi-${item.id}`}
                    value={pilihan}
                    checked={jawaban[item.id] === pilihan}
                    onChange={() => setJawaban({ ...jawaban, [item.id]: pilihan })}
                    disabled={isDone}
                    className="w-4 h-4 mt-0.5 text-orange-600 focus:ring-orange-500 shrink-0"
                  />
                  <span>{pilihan}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {!isDone && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-lg transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-base"
          >
            <Send size={18} />
            <span>{isSubmitting ? 'Memproses Pengiriman...' : 'Kirim Seluruh Jawaban Evaluasi'}</span>
          </button>
        )}
      </form>
    </div>
  );
}
