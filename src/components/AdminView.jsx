import { useState, useEffect, useMemo } from 'react';
import { Trash2, RefreshCw, Search, AlertTriangle, FileSpreadsheet, ChevronLeft, ChevronRight, Users, Award, BookCheck, Printer, X, Eye } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useToast } from '../hooks/useToast';

export default function AdminView() {
  const [dataRefleksi, setDataRefleksi] = useState([]);
  const [dataEvaluasi, setDataEvaluasi] = useState([]);
  const [dataRPL, setDataRPL] = useState([]);
  const [activeTab, setActiveTab] = useState('refleksi');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modal Print / Detail Siswa
  const [selectedDetail, setSelectedDetail] = useState(null);

  const { showToast } = useToast();

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const [refRes, evalRes, rplRes] = await Promise.all([
          supabase.from('refleksi').select('*').order('created_at', { ascending: false }),
          supabase.from('evaluasi').select('*').order('created_at', { ascending: false }),
          supabase.from('konseling_rpl').select('*').order('created_at', { ascending: false })
        ]);

        if (!ignore) {
          if (refRes.error) console.error("Error tabel refleksi:", refRes.error.message);
          else setDataRefleksi(refRes.data || []);

          if (evalRes.error) console.error("Error tabel evaluasi:", evalRes.error.message);
          else setDataEvaluasi(evalRes.data || []);

          if (rplRes.error) console.error("Error tabel konseling_rpl:", rplRes.error.message);
          else setDataRPL(rplRes.data || []);
        }
      } catch (e) {
        console.error("Gagal memuat data admin:", e);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshTrigger((prev) => prev + 1);
    showToast('Memuat ulang data terbaru dari database...', 'info', 2000);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setCurrentPage(1);
  };

  // FUNGSI UNTUK MENGHAPUS DATA
  const handleDelete = async (tableName, documentId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini secara permanen dari Supabase?")) {
      try {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', documentId);

        if (error) throw error;
        showToast('Data berhasil dihapus dari database!', 'success');
        handleRefresh();
      } catch (error) {
        showToast('Gagal menghapus data: ' + error.message, 'error');
      }
    }
  };

  // DAFTAR KELAS UNIK DARI SEMUA DATA
  const uniqueClasses = useMemo(() => {
    const classes = new Set();
    [...dataRefleksi, ...dataEvaluasi, ...dataRPL].forEach((item) => {
      const cls = item.userClass || item.user_class;
      if (cls) classes.add(cls);
    });
    return Array.from(classes).sort();
  }, [dataRefleksi, dataEvaluasi, dataRPL]);

  // STATISTIK RINGKAS
  const stats = useMemo(() => {
    const totalStudents = new Set([
      ...dataRefleksi.map((r) => `${r.userId || r.user_id}_${r.userClass || r.user_class}`),
      ...dataEvaluasi.map((e) => `${e.userId || e.user_id}_${e.userClass || e.user_class}`),
      ...dataRPL.map((k) => `${k.userId || k.user_id}_${k.userClass || k.user_class}`)
    ]).size;

    const avgScore = dataEvaluasi.length > 0
      ? Math.round(dataEvaluasi.reduce((acc, curr) => acc + (Number(curr.skor) || 0), 0) / dataEvaluasi.length)
      : 0;

    return {
      totalStudents,
      avgScore,
      totalRefleksi: dataRefleksi.length,
      totalEvaluasi: dataEvaluasi.length,
      totalRPL: dataRPL.length
    };
  }, [dataRefleksi, dataEvaluasi, dataRPL]);

  // FILTER DATA SESUAI PENCARIAN & KELAS
  const filteredRefleksi = useMemo(() => {
    return dataRefleksi.filter((item) => {
      const name = (item.userId || item.user_id || '').toLowerCase();
      const userClass = (item.userClass || item.user_class || '').toLowerCase();
      const matchSearch = name.includes(searchTerm.toLowerCase()) || userClass.includes(searchTerm.toLowerCase());
      const matchClass = selectedClass === 'all' || (item.userClass || item.user_class) === selectedClass;
      return matchSearch && matchClass;
    });
  }, [dataRefleksi, searchTerm, selectedClass]);

  const filteredEvaluasi = useMemo(() => {
    return dataEvaluasi.filter((item) => {
      const name = (item.userId || item.user_id || '').toLowerCase();
      const userClass = (item.userClass || item.user_class || '').toLowerCase();
      const matchSearch = name.includes(searchTerm.toLowerCase()) || userClass.includes(searchTerm.toLowerCase());
      const matchClass = selectedClass === 'all' || (item.userClass || item.user_class) === selectedClass;
      return matchSearch && matchClass;
    });
  }, [dataEvaluasi, searchTerm, selectedClass]);

  const filteredRPL = useMemo(() => {
    return dataRPL.filter((item) => {
      const name = (item.userId || item.user_id || '').toLowerCase();
      const userClass = (item.userClass || item.user_class || '').toLowerCase();
      const matchSearch = name.includes(searchTerm.toLowerCase()) || userClass.includes(searchTerm.toLowerCase());
      const matchClass = selectedClass === 'all' || (item.userClass || item.user_class) === selectedClass;
      return matchSearch && matchClass;
    });
  }, [dataRPL, searchTerm, selectedClass]);

  // DATA AKTIF DENGAN PAGINASI
  const currentList = activeTab === 'refleksi' ? filteredRefleksi : activeTab === 'evaluasi' ? filteredEvaluasi : filteredRPL;
  const totalPages = Math.ceil(currentList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return currentList.slice(start, start + pageSize);
  }, [currentList, currentPage, pageSize]);

  // FUNGSI EXPORT KE CSV / EXCEL
  const exportToCSV = (tab) => {
    let rows = [];
    let filename = '';

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    if (tab === 'refleksi') {
      filename = `data-refleksi-${new Date().toISOString().slice(0, 10)}.csv`;
      rows.push(['Waktu', 'Nama Siswa', 'Kelas', 'Perasaan Sebelum Membolos', 'Dampak Perilaku']);
      filteredRefleksi.forEach((r) => {
        rows.push([
          r.created_at ? new Date(r.created_at).toLocaleString('id-ID') : '',
          r.userId || r.user_id || '',
          r.userClass || r.user_class || '',
          r.q1 || '',
          r.q2 || ''
        ]);
      });
    } else if (tab === 'evaluasi') {
      filename = `data-evaluasi-${new Date().toISOString().slice(0, 10)}.csv`;
      rows.push(['Waktu', 'Nama Siswa', 'Kelas', 'Skor Akhir']);
      filteredEvaluasi.forEach((r) => {
        rows.push([
          r.created_at ? new Date(r.created_at).toLocaleString('id-ID') : '',
          r.userId || r.user_id || '',
          r.userClass || r.user_class || '',
          r.skor ?? ''
        ]);
      });
    } else if (tab === 'rpl') {
      filename = `data-konseling-rpl-${new Date().toISOString().slice(0, 10)}.csv`;
      rows.push(['Waktu', 'Nama Siswa', 'Kelas', 'Tahap RPL', 'Kelebihan', 'Kelemahan', 'Pemicu Membolos', 'Komitmen']);
      filteredRPL.forEach((r) => {
        rows.push([
          r.created_at ? new Date(r.created_at).toLocaleString('id-ID') : '',
          r.userId || r.user_id || '',
          r.userClass || r.user_class || '',
          (r.rpl || '').toUpperCase(),
          r.kelebihan || '',
          r.kelemahan || '',
          r.pemicu || '',
          r.komitmen || ''
        ]);
      });
    }

    if (rows.length <= 1) {
      return showToast('Tidak ada data yang dapat diekspor pada filter ini.', 'error');
    }

    // Menggunakan UTF-8 BOM agar terbaca sempurna di Microsoft Excel
    const csvContent = '\uFEFF' + rows.map((e) => e.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`File ${filename} berhasil diunduh!`, 'success');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* PERINGATAN JIKA SUPABASE BELUM DIKONFIGURASI */}
      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-amber-800 text-sm md:text-base">Supabase Belum Dihubungkan</h3>
              <p className="text-sm text-amber-700 mt-1">
                Silakan masukkan <strong>VITE_SUPABASE_URL</strong> dan <strong>VITE_SUPABASE_ANON_KEY</strong> pada file <code>.env</code> Anda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DAN STATISTIK SINGKAT */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Panel Guru BK (Administrator)</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Manajemen respons siswa menggunakan database Supabase (kapasitas data tinggi & terpusat)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 border rounded-xl text-gray-700 hover:bg-gray-50 transition text-xs md:text-sm font-semibold shadow-sm"
            title="Muat ulang data dari Supabase"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-blue-600' : ''} />
            <span>{isLoading ? 'Memuat...' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => exportToCSV(activeTab)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition text-xs md:text-sm font-bold shadow-sm"
            title="Unduh data tabel saat ini ke format Excel / CSV"
          >
            <FileSpreadsheet size={16} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* RINGKASAN STATISTIK DATA BANYAK */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Users size={22} /></div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Siswa Terdata</p>
            <h3 className="text-xl font-bold text-gray-800">{stats.totalStudents}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><BookCheck size={22} /></div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Kelas Berpartisipasi</p>
            <h3 className="text-xl font-bold text-gray-800">{uniqueClasses.length}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Award size={22} /></div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Rata-rata Evaluasi</p>
            <h3 className="text-xl font-bold text-orange-600">{stats.avgScore} <span className="text-xs text-gray-400 font-normal">/ 100</span></h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl"><Users size={22} /></div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Isian RPL</p>
            <h3 className="text-xl font-bold text-gray-800">{stats.totalRPL}</h3>
          </div>
        </div>
      </div>

      {/* BAR PENCARIAN & FILTER KELAS */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama siswa atau kelas..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border rounded-xl text-xs md:text-sm outline-none focus:ring-2 focus:ring-blue-500 border-gray-200"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-600 whitespace-nowrap">Kelas:</label>
            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs md:text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Kelas ({uniqueClasses.length})</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-600 whitespace-nowrap">Baris:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs md:text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* TOMBOL NAVIGASI TAB */}
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-full md:w-fit overflow-x-auto">
        <button
          onClick={() => handleTabChange('refleksi')}
          className={`px-5 py-2.5 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-2 text-xs md:text-sm ${
            activeTab === 'refleksi' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>1. Data Refleksi</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'refleksi' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {dataRefleksi.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('evaluasi')}
          className={`px-5 py-2.5 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-2 text-xs md:text-sm ${
            activeTab === 'evaluasi' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>2. Skor Evaluasi</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'evaluasi' ? 'bg-orange-700 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {dataEvaluasi.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('rpl')}
          className={`px-5 py-2.5 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-2 text-xs md:text-sm ${
            activeTab === 'rpl' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>3. Konseling (RPL)</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'rpl' ? 'bg-green-800 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {dataRPL.length}
          </span>
        </button>
      </div>

      {/* TAB 1: DATA REFLEKSI */}
      {activeTab === 'refleksi' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">Jawaban Refleksi Diri Siswa</h2>
            <span className="text-xs text-gray-500 font-medium">Total: {filteredRefleksi.length} entri</span>
          </div>
          <table className="w-full text-left border-collapse min-w-max text-xs md:text-sm">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="p-3 border border-blue-100">Waktu</th>
                <th className="p-3 border border-blue-100">Nama Siswa</th>
                <th className="p-3 border border-blue-100">Kelas</th>
                <th className="p-3 border border-blue-100">Perasaan Sebelum Membolos</th>
                <th className="p-3 border border-blue-100">Dampak Perilaku</th>
                <th className="p-3 border border-blue-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">Belum ada data refleksi yang sesuai.</td></tr>
              ) : paginatedList.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 text-gray-800 transition">
                  <td className="p-3 border text-xs text-gray-500 whitespace-nowrap">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="p-3 border font-bold text-blue-900">{row.userId || row.user_id}</td>
                  <td className="p-3 border">{row.userClass || row.user_class}</td>
                  <td className="p-3 border max-w-xs">{row.q1}</td>
                  <td className="p-3 border max-w-xs">{row.q2}</td>
                  <td className="p-3 border text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedDetail({ type: 'refleksi', data: row })}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition"
                        title="Lihat Detail & Cetak"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete('refleksi', row.id)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition"
                        title="Hapus Data"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: DATA EVALUASI */}
      {activeTab === 'evaluasi' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">Skor Uji Evaluasi Siswa</h2>
            <span className="text-xs text-gray-500 font-medium">Total: {filteredEvaluasi.length} entri</span>
          </div>
          <table className="w-full text-left border-collapse min-w-max text-xs md:text-sm">
            <thead>
              <tr className="bg-orange-50 text-orange-900">
                <th className="p-3 border border-orange-100">Waktu</th>
                <th className="p-3 border border-orange-100">Nama Siswa</th>
                <th className="p-3 border border-orange-100">Kelas</th>
                <th className="p-3 border border-orange-100">Skor Akhir</th>
                <th className="p-3 border border-orange-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-400">Belum ada data evaluasi yang sesuai.</td></tr>
              ) : paginatedList.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 text-gray-800 transition">
                  <td className="p-3 border text-xs text-gray-500 whitespace-nowrap">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="p-3 border font-bold text-orange-950">{row.userId || row.user_id}</td>
                  <td className="p-3 border">{row.userClass || row.user_class}</td>
                  <td className="p-3 border font-black text-orange-600 text-base">
                    {row.skor} <span className="text-xs font-normal text-gray-500">/ 100</span>
                  </td>
                  <td className="p-3 border text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedDetail({ type: 'evaluasi', data: row })}
                        className="p-1.5 bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white rounded-lg transition"
                        title="Lihat Detail & Cetak"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete('evaluasi', row.id)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition"
                        title="Hapus Data"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: DATA RPL */}
      {activeTab === 'rpl' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">Data Konseling Kelompok (RPL)</h2>
            <span className="text-xs text-gray-500 font-medium">Total: {filteredRPL.length} entri</span>
          </div>
          <table className="w-full text-left border-collapse min-w-max text-xs md:text-sm">
            <thead>
              <tr className="bg-green-50 text-green-900">
                <th className="p-3 border border-green-100">Waktu</th>
                <th className="p-3 border border-green-100">Nama Siswa</th>
                <th className="p-3 border border-green-100">Kelas</th>
                <th className="p-3 border border-green-100">Tahap RPL</th>
                <th className="p-3 border border-green-100">Isi Jawaban / Komitmen</th>
                <th className="p-3 border border-green-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">Belum ada data RPL yang sesuai.</td></tr>
              ) : paginatedList.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 text-gray-800 transition">
                  <td className="p-3 border text-xs text-gray-500 whitespace-nowrap">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="p-3 border font-bold text-green-950">{row.userId || row.user_id}</td>
                  <td className="p-3 border">{row.userClass || row.user_class}</td>
                  <td className="p-3 border font-extrabold uppercase text-green-700">{row.rpl}</td>
                  <td className="p-3 border max-w-md">
                    {row.rpl === 'rpl1' && (
                      <span><strong>Kelebihan:</strong> {row.kelebihan} <br/><br/> <strong>Perbaikan:</strong> {row.kelemahan}</span>
                    )}
                    {row.rpl === 'rpl2' && (
                      <span><strong>Pemicu Membolos:</strong> {row.pemicu}</span>
                    )}
                    {row.rpl === 'rpl3' && (
                      <span><strong>Komitmen:</strong> {row.komitmen}</span>
                    )}
                  </td>
                  <td className="p-3 border text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedDetail({ type: 'rpl', data: row })}
                        className="p-1.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition"
                        title="Lihat Detail & Cetak"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete('konseling_rpl', row.id)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition"
                        title="Hapus Data"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* NAVIGASI PAGINASI */}
      {currentList.length > 0 && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3 text-xs md:text-sm text-gray-600">
          <div>
            Menampilkan data ke-<strong>{((currentPage - 1) * pageSize) + 1}</strong> - <strong>{Math.min(currentPage * pageSize, currentList.length)}</strong> dari <strong>{currentList.length}</strong> entri
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 py-1 font-bold text-gray-700 bg-gray-100 rounded-xl text-xs">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Halaman Selanjutnya"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL CETAK / DETAIL SISWA */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-800 text-sm md:text-base">
                Lembar Portofolio Siswa (Bimbingan Konseling)
              </h3>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs md:text-sm text-gray-700">
              <div className="text-center pb-4 border-b border-gray-200">
                <h4 className="font-extrabold text-base text-gray-900 uppercase">SMKN JATIROGO - LAYANAN BK</h4>
                <p className="text-[11px] text-gray-500">Mengenal Diri, Melangkah Maju - Tahun Ajaran 2026/2027</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl">
                <div>
                  <span className="text-gray-400 block text-[11px]">Nama Siswa:</span>
                  <strong className="text-gray-900">{selectedDetail.data.userId || selectedDetail.data.user_id}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Kelas / Jurusan:</span>
                  <strong className="text-gray-900">{selectedDetail.data.userClass || selectedDetail.data.user_class}</strong>
                </div>
              </div>

              {selectedDetail.type === 'refleksi' && (
                <div className="space-y-3">
                  <div>
                    <strong className="text-gray-800 block mb-1">1. Perasaan / Pikiran Sebelum Membolos:</strong>
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">{selectedDetail.data.q1}</div>
                  </div>
                  <div>
                    <strong className="text-gray-800 block mb-1">2. Dampak Perilaku yang Disadari:</strong>
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">{selectedDetail.data.q2}</div>
                  </div>
                </div>
              )}

              {selectedDetail.type === 'evaluasi' && (
                <div className="text-center py-4 bg-orange-50 rounded-xl border border-orange-100">
                  <span className="text-xs font-semibold text-orange-700 uppercase block mb-1">Skor Evaluasi Pemahaman</span>
                  <strong className="text-4xl font-black text-orange-600">{selectedDetail.data.skor} / 100</strong>
                </div>
              )}

              {selectedDetail.type === 'rpl' && (
                <div className="space-y-3">
                  <div className="inline-block px-3 py-1 bg-green-100 text-green-800 font-bold rounded-lg text-xs">
                    Tahapan {(selectedDetail.data.rpl || '').toUpperCase()}
                  </div>
                  {selectedDetail.data.rpl === 'rpl1' && (
                    <>
                      <div>
                        <strong className="text-gray-800 block mb-1">Kelebihan / Kekuatan Pribadi:</strong>
                        <div className="p-3 bg-green-50/50 rounded-lg border border-green-100">{selectedDetail.data.kelebihan}</div>
                      </div>
                      <div>
                        <strong className="text-gray-800 block mb-1">Hal yang Ingin Diperbaiki:</strong>
                        <div className="p-3 bg-green-50/50 rounded-lg border border-green-100">{selectedDetail.data.kelemahan}</div>
                      </div>
                    </>
                  )}
                  {selectedDetail.data.rpl === 'rpl2' && (
                    <div>
                      <strong className="text-gray-800 block mb-1">Pemicu Keinginan Membolos:</strong>
                      <div className="p-3 bg-green-50/50 rounded-lg border border-green-100">{selectedDetail.data.pemicu}</div>
                    </div>
                  )}
                  {selectedDetail.data.rpl === 'rpl3' && (
                    <div>
                      <strong className="text-gray-800 block mb-1">Komitmen Rencana Perubahan:</strong>
                      <div className="p-3 bg-green-50/50 rounded-lg border border-green-100">{selectedDetail.data.komitmen}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6 pt-6 mt-6 border-t text-center text-[11px]">
                <div>
                  <p>Guru Pembimbing (BK),</p>
                  <div className="h-16"></div>
                  <p className="font-semibold underline">............................................</p>
                </div>
                <div>
                  <p>Siswa Bersangkutan,</p>
                  <div className="h-16"></div>
                  <p className="font-semibold underline">{selectedDetail.data.userId || selectedDetail.data.user_id}</p>
                </div>
              </div>
            </div>

            <div className="p-3 border-t bg-gray-50 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Printer size={15} /> Cetak Lembar Ini
              </button>
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-gray-200 transition"
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
