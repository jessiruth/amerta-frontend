import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import "../styles/GudangDetail.css";

const GoodsTransportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (!token) {
          setError("Unauthorized: Token tidak ditemukan");
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get(`/api/barang/transfer/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.data) {
          setData(response.data.data);
        } else {
          setError("Data tidak ditemukan.");
        }

      } catch (err) {
        if (err.response) {
          setError(err.response.data.message || "Data tidak ditemukan.");
        } else {
          setError("Terjadi kesalahan saat mengambil data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, token]);

  if (loading) {
    return (
      <div className="gudang-detail-container">
        <div className="gudang-detail-content">
          <div className="loading-container">
            <div className="loading-text">Memuat detail pemindahan barang...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gudang-detail-container">
        <div className="gudang-detail-content">
          <div className="error-container">
            <div className="error-text">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gudang-detail-container">
      <div className="gudang-detail-content">
        <div className="page-header">
          <h1 className="page-title">Detail Pemindahan Barang</h1>
        </div>

        <div className="action-buttons">
          <button className="back-btn" onClick={() => navigate("/goods-transport")}>
            Kembali
          </button>
        </div>

        <div className="detail-card">
          <div className="section-header">
            <h2 className="section-title">Informasi Umum</h2>
          </div>
          <div className="section-content">
            <div className="detail-row">
              <span className="detail-label">ID Pemindahan:</span>
              <span className="detail-value">{data.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tanggal Pemindahan:</span>
              <span className="detail-value">{new Date(data.tanggalPemindahan).toLocaleDateString("id-ID")}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Gudang Asal:</span>
              <span className="detail-value">{data.gudangAsal}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Gudang Tujuan:</span>
              <span className="detail-value">{data.gudangTujuan}</span>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <div className="section-header">
            <h2 className="section-title">Daftar Barang</h2>
          </div>
          <div className="section-content">
            <table className="barang-table">
              <thead>
                <tr>
                  <th>ID Barang</th>
                  <th>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {data.listBarang.length > 0 ? (
                  data.listBarang.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.jumlah}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">Tidak ada barang yang dipindahkan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodsTransportDetail;