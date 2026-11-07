import { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, List, X, BookmarkCheck } from 'lucide-react';
import { eBookPages } from '../dataMateri';

export default function MateriView() {
  const [page, setPage] = useState(0);
  const [isTocOpen, setIsTocOpen] = useState(false);

  const totalPages = eBookPages.length;
  const currentPageData = eBookPages[page] || eBookPages[0];
  const progressPercentage = Math.round(((page + 1) / totalPages) * 100);

  const handleSelectPage = (index) => {
    setPage(index);
    setIsTocOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* HEADER ATAS DENGAN TOMBOL DAFTAR ISI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Materi E-Modul BK</h2>
            <p className="text-xs text-gray-500">Mengenal Diri, Melangkah Maju - SMKN Jatirogo</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Buka Daftar Isi */}
          <button
            onClick={() => setIsTocOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-semibold text-xs md:text-sm transition"
            title="Buka Daftar Isi Halaman"
          >
            <List size={16} />
            <span>Daftar Isi</span>
          </button>

          <span className="text-xs font-bold px-3 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 whitespace-nowrap">
            Hal. {page + 1} / {totalPages}
          </span>
        </div>
      </div>

      {/* PROGRESS BAR MEMBACA */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-blue-600 h-1.5 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* KONTEN BUKU */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[550px]">
        {/* Header Judul Halaman */}
        <div className="p-5 md:p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 rounded-t-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <BookmarkCheck size={14} /> Halaman {page + 1}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 leading-snug">
            {currentPageData.title}
          </h1>
        </div>

        {/* Teks Isi Materi */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto whitespace-pre-wrap text-gray-700 leading-relaxed text-sm md:text-base font-normal tracking-wide">
          {currentPageData.content}
        </div>

        {/* Tombol Navigasi Bawah */}
        <div className="p-4 md:p-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/60 rounded-b-2xl">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
          >
            <ChevronLeft size={18} />
            <span>Sebelumnya</span>
          </button>

          <span className="text-xs text-gray-400 hidden sm:inline">
            Gunakan tombol panah untuk membalik halaman
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
          >
            <span>Selanjutnya</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* MODAL DRAWER DAFTAR ISI */}
      {isTocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100">
            {/* Header Modal */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List size={20} className="text-blue-600" />
                <h3 className="font-bold text-gray-800 text-base">Daftar Isi E-Modul (17 Halaman)</h3>
              </div>
              <button
                onClick={() => setIsTocOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* List Halaman */}
            <div className="p-4 overflow-y-auto divide-y divide-gray-100 space-y-1">
              {eBookPages.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPage(idx)}
                  className={`w-full text-left p-3 rounded-xl transition flex items-start gap-3 ${
                    page === idx
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700 font-medium'
                  }`}
                >
                  <span
                    className={`shrink-0 w-6 h-6 flex items-center justify-center text-xs rounded-full font-bold ${
                      page === idx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-xs md:text-sm leading-snug">{item.title}</span>
                </button>
              ))}
            </div>

            {/* Footer Modal */}
            <div className="p-3 border-t bg-gray-50 rounded-b-2xl text-right">
              <button
                onClick={() => setIsTocOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

