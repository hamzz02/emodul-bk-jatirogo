import { useState, useEffect, useMemo } from 'react';
import { Trash2, RefreshCw, Search, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabase';

export default function AdminView() {
  const [dataRefleksi, setDataRefleksi] = useState([]);
  const [dataEvaluasi, setDataEvaluasi] = useState([]);
  const [dataRPL, setDataRPL] = useState([]);
  const [activeTab, setActiveTab] = useState('refleksi');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    setRefreshTrigger(prev => prev + 1);
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
        alert("Data berhasil dihapus!");
        handleRefresh();
      } catch (error) {
        alert("Gagal menghapus data: " + error.message);
      }
    }
  };

  // DAFTAR KELAS UNIK DARI SEMUA DATA
  const uniqueClasses = useMemo(() => {
    const classes = new Set();
    [...dataRefleksi, ...dataEvaluasi, ...dataRPL].forEach(item => {
      const cls = item.userClass || item.user_class;
      if (cls) classes.add(cls);
    });
    return Array.from(classes).sort();
  }, [dataRefleksi, dataEvaluasi, dataRPL]);

  // FILTER DATA SESUAI PENCARIAN & KELAS
  const filteredRefleksi = useMemo(() => {
    return dataRefleksi.filter(item => {
      const name = (item.userId || item.user_id || '').toLowerCase();
      const userClass = (item.userClass || item.user_class || '').toLowerCase();
      const matchSearch = name.includes(searchTerm.toLowerCase()) || userClass.includes(searchTerm.toLowerCase());
      const matchClass = selectedClass === 'all' || (item.userClass || item.user_class) === selectedClass;
      return matchSearch && matchClass;
    });
  }, [dataRefleksi, searchTerm, selectedClass]);

  const filteredEvaluasi = useMemo(() => {
    return dataEvaluasi.filter(item => {
      const name = (item.userId || item.user_id || '').toLowerCase();
      const userClass = (item.userClass || item.user_class || '').toLowerCase();
      const matchSearch = name.includes(searchTerm.toLowerCase()) || userClass.includes(searchTerm.toLowerCase());
      const matchClass = selectedClass === 'all' || (item.userClass || item.user_class) === selectedClass;
      return matchSearch && matchClass;
    });
  }, [dataEvaluasi, searchTerm, selectedClass]);

  const filteredRPL = useMemo(() => {
    return dataRPL.filter(item => {
      const name = (item.userId || item.user_id || '').toLowerCase();
      const userClass = (item.userClass || item.user_class || '').toLowerCase();
      const matchSearch = name.includes(searchTerm.toLowerCase()) || userClass.includes(searchTerm.toLowerCase());
      const matchClass = selectedClass === 'all' || (item.userClass || item.user_class) === selectedClass;
      return matchSearch && matchClass;
    });
  }, [dataRPL, searchTerm, selectedClass]);

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
      filteredRefleksi.forEach(r => {
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
      filteredEvaluasi.forEach(r => {
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
      filteredRPL.forEach(r => {
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
      return alert('Tidak ada data yang dapat diekspor.');
    }

    // Menggunakan UTF-8 BOM agar terbaca sempurna di Microsoft Excel
    const csvContent = '\uFEFF' + rows.map(e => e.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* PERINGATAN JIKA SUPABASE BELUM DIKONFIGURASI */}
      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-amber-800 text-sm md:text-base">Supabase Belum Dihubungkan</h3>
              <p className="text-sm text-amber-700 mt-1">
                Silakan isi <strong>VITE_SUPABASE_URL</strong> dan <strong>VITE_SUPABASE_ANON_KEY</strong> pada file <code>.env</code> Anda, dan jalankan perintah pada <code>supabase_schema.sql</code> di Supabase SQL Editor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DAN STATISTIK SINGKAT */}
      <div className="bg-white p-6 rounded-xl shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel Guru BK (Administrator)</h1>
          <p className="text-sm text-gray-500 mt-1">Manajemen respons siswa menggunakan database Supabase (kapasitas data tinggi & terpusat)</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium shadow-sm"
            title="Muat ulang data dari Supabase"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin text-blue-600" : ""} />
            <span>{isLoading ? 'Memuat...' : 'Refresh'}</span>
          </button>
          <button 
            onClick={() => exportToCSV(activeTab)} 
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-sm font-medium shadow-sm"
            title="Unduh data tabel saat ini ke format Excel / CSV"
          >
            <FileSpreadsheet size={16} />
            <span>Export Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* BAR PENCARIAN & FILTER KELAS */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama siswa atau kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Filter Kelas:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
          >
            <option value="all">Semua Kelas ({uniqueClasses.length})</option>
            {uniqueClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TOMBOL NAVIGASI TAB */}
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 bg-white p-2 rounded-xl shadow w-full md:w-fit overflow-x-auto">
        <button 
          onClick={() => setActiveTab('refleksi')} 
          className={`px-5 py-2 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'refleksi' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <span>1. Data Refleksi</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'refleksi' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {dataRefleksi.length}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab('evaluasi')} 
          className={`px-5 py-2 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'evaluasi' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <span>2. Skor Evaluasi</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'evaluasi' ? 'bg-orange-700 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {dataEvaluasi.length}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab('rpl')} 
          className={`px-5 py-2 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'rpl' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <span>3. Konseling (RPL)</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'rpl' ? 'bg-green-800 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {dataRPL.length}
          </span>
        </button>
      </div>

      {/* TAB 1: DATA REFLEKSI */}
      {activeTab === 'refleksi' && (
        <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Jawaban Refleksi Diri Siswa</h2>
            <span className="text-sm text-gray-500 font-medium">Menampilkan {filteredRefleksi.length} data</span>
          </div>
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-blue-50 text-blue-800">
                <th className="p-3 border border-blue-100">Waktu</th>
                <th className="p-3 border border-blue-100">Nama Siswa</th>
                <th className="p-3 border border-blue-100">Kelas</th>
                <th className="p-3 border border-blue-100">Perasaan Sebelum Membolos</th>
                <th className="p-3 border border-blue-100">Dampak Perilaku</th>
                <th className="p-3 border border-blue-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefleksi.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-500 font-medium">Belum ada data refleksi yang sesuai.</td></tr>
              ) : filteredRefleksi.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 text-gray-800 transition-colors">
                  <td className="p-3 border text-xs text-gray-500 whitespace-nowrap">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="p-3 border font-semibold">{row.userId || row.user_id}</td>
                  <td className="p-3 border text-sm">{row.userClass || row.user_class}</td>
                  <td className="p-3 border text-sm max-w-xs">{row.q1}</td>
                  <td className="p-3 border text-sm max-w-xs">{row.q2}</td>
                  <td className="p-3 border text-center">
                    <button onClick={() => handleDelete('refleksi', row.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded transition-colors" title="Hapus Data">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: DATA EVALUASI */}
      {activeTab === 'evaluasi' && (
        <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Skor Uji Evaluasi Siswa</h2>
            <span className="text-sm text-gray-500 font-medium">Menampilkan {filteredEvaluasi.length} data</span>
          </div>
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-orange-50 text-orange-800">
                <th className="p-3 border border-orange-100">Waktu</th>
                <th className="p-3 border border-orange-100">Nama Siswa</th>
                <th className="p-3 border border-orange-100">Kelas</th>
                <th className="p-3 border border-orange-100">Skor Akhir</th>
                <th className="p-3 border border-orange-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvaluasi.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-500 font-medium">Belum ada data evaluasi yang sesuai.</td></tr>
              ) : filteredEvaluasi.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 text-gray-800 transition-colors">
                  <td className="p-3 border text-xs text-gray-500 whitespace-nowrap">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="p-3 border font-semibold">{row.userId || row.user_id}</td>
                  <td className="p-3 border text-sm">{row.userClass || row.user_class}</td>
                  <td className="p-3 border font-bold text-orange-600 text-lg">
                    {row.skor} <span className="text-sm font-normal text-gray-500">/ 100</span>
                  </td>
                  <td className="p-3 border text-center">
                    <button onClick={() => handleDelete('evaluasi', row.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded transition-colors" title="Hapus Data">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: DATA RPL */}
      {activeTab === 'rpl' && (
        <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Data Konseling Kelompok (RPL)</h2>
            <span className="text-sm text-gray-500 font-medium">Menampilkan {filteredRPL.length} data</span>
          </div>
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-green-50 text-green-800">
                <th className="p-3 border border-green-100">Waktu</th>
                <th className="p-3 border border-green-100">Nama Siswa</th>
                <th className="p-3 border border-green-100">Kelas</th>
                <th className="p-3 border border-green-100">Tahap RPL</th>
                <th className="p-3 border border-green-100">Isi Jawaban / Komitmen</th>
                <th className="p-3 border border-green-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRPL.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-500 font-medium">Belum ada data RPL yang sesuai.</td></tr>
              ) : filteredRPL.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 text-gray-800 transition-colors">
                  <td className="p-3 border text-xs text-gray-500 whitespace-nowrap">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="p-3 border font-semibold">{row.userId || row.user_id}</td>
                  <td className="p-3 border text-sm">{row.userClass || row.user_class}</td>
                  <td className="p-3 border font-bold uppercase text-green-600">{row.rpl}</td>
                  <td className="p-3 border text-sm max-w-md">
                    {row.rpl === 'rpl1' && (
                      <span><strong>Kelebihan:</strong> {row.kelebihan} <br/><br/> <strong>Hal yg diperbaiki:</strong> {row.kelemahan}</span>
                    )}
                    {row.rpl === 'rpl2' && (
                      <span><strong>Pemicu Membolos:</strong> {row.pemicu}</span>
                    )}
                    {row.rpl === 'rpl3' && (
                      <span><strong>Komitmen:</strong> {row.komitmen}</span>
                    )}
                  </td>
                  <td className="p-3 border text-center">
                    <button onClick={() => handleDelete('konseling_rpl', row.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded transition-colors" title="Hapus Data">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
