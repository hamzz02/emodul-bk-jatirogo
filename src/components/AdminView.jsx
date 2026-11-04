import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';
import { db } from '../firebase'; 

export default function AdminView() {
  const [dataRefleksi, setDataRefleksi] = useState([]);
  const [dataEvaluasi, setDataEvaluasi] = useState([]);
  const [dataRPL, setDataRPL] = useState([]);
  const [activeTab, setActiveTab] = useState('refleksi'); 

  const fetchData = async () => {
    try {
      const refSnap = await getDocs(collection(db, "refleksi"));
      setDataRefleksi(refSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const evalSnap = await getDocs(collection(db, "evaluasi"));
      setDataEvaluasi(evalSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const rplSnap = await getDocs(collection(db, "konseling_rpl"));
      setDataRPL(rplSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.log("Error loading admin data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // FUNGSI UNTUK MENGHAPUS DATA
  const handleDelete = async (collectionName, documentId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini secara permanen?")) {
      try {
        await deleteDoc(doc(db, collectionName, documentId));
        alert("Data berhasil dihapus!");
        fetchData(); // Refresh tabel secara otomatis
      } catch (error) {
        alert("Gagal menghapus data: " + error.message);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* TOMBOL NAVIGASI TAB */}
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 bg-white p-2 rounded-xl shadow w-full md:w-fit overflow-x-auto">
        <button onClick={() => setActiveTab('refleksi')} className={`px-5 py-2 rounded-lg font-bold transition-colors whitespace-nowrap ${activeTab === 'refleksi' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          1. Data Refleksi
        </button>
        <button onClick={() => setActiveTab('evaluasi')} className={`px-5 py-2 rounded-lg font-bold transition-colors whitespace-nowrap ${activeTab === 'evaluasi' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          2. Skor Evaluasi
        </button>
        <button onClick={() => setActiveTab('rpl')} className={`px-5 py-2 rounded-lg font-bold transition-colors whitespace-nowrap ${activeTab === 'rpl' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          3. Konseling (RPL)
        </button>
      </div>

      {/* TAB 1: DATA REFLEKSI */}
      {activeTab === 'refleksi' && (
        <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Jawaban Refleksi Diri Siswa</h2>
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-blue-50 text-blue-800">
                <th className="p-3 border border-blue-100">Nama Siswa</th>
                <th className="p-3 border border-blue-100">Kelas</th>
                <th className="p-3 border border-blue-100">Perasaan Sebelum Membolos</th>
                <th className="p-3 border border-blue-100">Dampak Perilaku</th>
                <th className="p-3 border border-blue-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataRefleksi.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-gray-500 font-medium">Belum ada data masuk.</td></tr>
              ) : dataRefleksi.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 text-gray-800">
                  <td className="p-3 border font-semibold">{row.userId}</td>
                  <td className="p-3 border text-sm">{row.userClass}</td>
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
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Skor Uji Evaluasi Siswa</h2>
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-orange-50 text-orange-800">
                <th className="p-3 border border-orange-100">Nama Siswa</th>
                <th className="p-3 border border-orange-100">Kelas</th>
                <th className="p-3 border border-orange-100">Skor Akhir</th>
                <th className="p-3 border border-orange-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataEvaluasi.length === 0 ? (
                <tr><td colSpan="4" className="p-4 text-center text-gray-500 font-medium">Belum ada data masuk.</td></tr>
              ) : dataEvaluasi.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 text-gray-800">
                  <td className="p-3 border font-semibold">{row.userId}</td>
                  <td className="p-3 border text-sm">{row.userClass}</td>
                  <td className="p-3 border font-bold text-orange-600 text-lg">{row.skor} <span className="text-sm font-normal text-gray-500">/ 100</span></td>
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
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Data Konseling Kelompok (RPL)</h2>
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-green-50 text-green-800">
                <th className="p-3 border border-green-100">Nama Siswa</th>
                <th className="p-3 border border-green-100">Kelas</th>
                <th className="p-3 border border-green-100">Tahap RPL</th>
                <th className="p-3 border border-green-100">Isi Jawaban / Komitmen</th>
                <th className="p-3 border border-green-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataRPL.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-gray-500 font-medium">Belum ada data masuk.</td></tr>
              ) : dataRPL.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 text-gray-800">
                  <td className="p-3 border font-semibold">{row.userId}</td>
                  <td className="p-3 border text-sm">{row.userClass}</td>
                  <td className="p-3 border font-bold uppercase text-green-600">{row.rpl}</td>
                  <td className="p-3 border text-sm max-w-md">
                    {row.rpl === 'rpl1' && (<span><strong>Kelebihan:</strong> {row.kelebihan} <br/><br/> <strong>Hal yg diperbaiki:</strong> {row.kelemahan}</span>)}
                    {row.rpl === 'rpl2' && (<span><strong>Pemicu Membolos:</strong> {row.pemicu}</span>)}
                    {row.rpl === 'rpl3' && (<span><strong>Komitmen:</strong> {row.komitmen}</span>)}
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