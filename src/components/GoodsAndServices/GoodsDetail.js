import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import '../../styles/GoodsDetail.css';

const GoodsDetail = () => {
  const [barang, setBarang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role")?.toLowerCase();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    axiosInstance.get(`/api/barang/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setBarang(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil detail barang:", err);
        setError("Gagal memuat data barang.");
        setLoading(false);
      });
  }, [id, navigate]);

  const handleBack = () => navigate('/goods-and-services');
  const handleUpdate = () => navigate(`/goods-and-services/update/${id}`);

  if (loading) {
    return (
      <div className="goods-detail-container">
        <div className="goods-detail-content">
          <div className="goods-loading-text">Memuat detail barang...</div>
        </div>
      </div>
    );
  }

  if (error || !barang) {
    return (
      <div className="goods-detail-container">
        <div className="goods-detail-content">
          <div className="goods-error-text">{error || "Data tidak ditemukan."}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="goods-detail-container">
      <div className="goods-detail-content">
        <div className="goods-page-header">
          <h1 className="goods-page-title">{barang.id}</h1>
        </div>

        <div className="goods-action-buttons">
          <button className="goods-back-btn" onClick={handleBack}>Kembali</button>

          {!["administrasi", "komisaris"].includes(userRole) && (
          <button className="goods-update-btn" onClick={handleUpdate}>Update Barang</button>
          )}

        </div>

        <div className="goods-card">
          <div className="goods-section-header">
            <h2 className="goods-section-title">Informasi Umum</h2>
          </div>
          <div className="goods-section-content">
            <div className="goods-row"><span className="goods-label">Nama:</span><span className="goods-value">{barang.nama}</span></div>
            <div className="goods-row"><span className="goods-label">Kategori:</span><span className="goods-value">{barang.kategori}</span></div>
            <div className="goods-row"><span className="goods-label">Merk:</span><span className="goods-value">{barang.merk}</span></div>
            <div className="goods-row"><span className="goods-label">Status:</span><span className="goods-value">{barang.active ? "Aktif" : "Tidak Aktif"}</span></div>
            <div className="goods-row"><span className="goods-label">Harga Beli:</span><span className="goods-value">Rp{barang.hargaBeli.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>
            <div className="goods-row"><span className="goods-label">Harga Jual:</span><span className="goods-value">Rp{barang.hargaJual.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>
            <div className="goods-row"><span className="goods-label">Total Stok:</span><span className="goods-value">{barang.totalStock}</span></div>
            <div className="goods-row"><span className="goods-label">Tanggal Dibuat:</span><span className="goods-value">{barang.createdDate}</span></div>
            <div className="goods-row"><span className="goods-label">Terakhir Diperbarui:</span><span className="goods-value">{barang.updatedDate}</span></div>
          </div>
        </div>

        <div className="goods-card">
          <div className="goods-section-header">
            <h2 className="goods-section-title">Stok per Gudang</h2>
          </div>
          <div className="goods-section-content">
            {barang.stockBarang?.length > 0 ? (
              <table className="goods-table">
                <thead>
                  <tr>
                    <th>Gudang</th>
                    <th>Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {barang.stockBarang.map((stock, idx) => (
                    <tr key={idx}>
                      <td>{stock.namaGudang}</td>
                      <td>{stock.stock} unit</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="goods-empty-stock">Belum ada data stok gudang.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodsDetail;
