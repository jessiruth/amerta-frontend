import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import "../styles/GudangDetail.css";

const RevenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/");
  }, [navigate, token]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (!token) {
          setError("Unauthorized: Token tidak ditemukan");
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get(`/api/penerimaan/view/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setData(response.data);
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
            <div className="loading-text">Memuat detail penerimaan...</div>
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

  if (!data) {
    return (
      <div className="gudang-detail-container">
        <div className="gudang-detail-content">
          <div className="error-text">Data tidak ditemukan.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="gudang-detail-container">
      <div className="gudang-detail-content">
        <div className="page-header">
          <h1 className="page-title">Detail Penerimaan</h1>
        </div>

        <div className="action-buttons">
          <button className="back-btn" onClick={() => navigate("/revenue")}>Kembali</button>
        </div>

        <div className="detail-card">
          <div className="section-header">
            <h2 className="section-title">Informasi Penerimaan</h2>
          </div>
          <div className="section-content">
            <div className="detail-row">
              <span className="detail-label">ID:</span>
              <span className="detail-value">{data.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Jenis Penerimaan:</span>
              <span className="detail-value">{data.jenisPenerimaan}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Jumlah:</span>
              <span className="detail-value">{data.jumlah.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tanggal Penerimaan:</span>
              <span className="detail-value">{new Date(data.tanggal).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Sumber Penerimaan:</span>
              <span className="detail-value">{data.sumberPenerimaan}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Keterangan:</span>
              <span className="detail-value">{data.keterangan}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDetail;