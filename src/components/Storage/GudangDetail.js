import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import '../../styles/GudangDetail.css';

const GudangDetail = () => {
    const [loading, setLoading] = useState(true);
    const [gudang, setGudang] = useState(null);
    const [error, setError] = useState(null);
    const { namaGudang } = useParams();
    const navigate = useNavigate();
    const role = localStorage.getItem("role")?.toLowerCase();

    const fetchGudangDetail = useCallback(async (token) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(`/api/gudang/${namaGudang}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (response.data && response.data.data) {
                setGudang(response.data.data);
            } else {
                setError('Data gudang tidak ditemukan.');
            }
        } catch (error) {
            console.error('Error fetching gudang detail:', error);
            if (error.response && error.response.status === 403) {
                setError('Anda tidak memiliki akses untuk melihat detail gudang');
                setTimeout(() => navigate('/gudang'), 2000);
            } else {
                setError('Gagal memuat detail gudang. Silakan coba lagi nanti.');
            }
        } finally {
            setLoading(false);
        }
    }, [namaGudang, navigate]);

    useEffect(() => {
        const token = localStorage.getItem("token");
    
        if (!token) {
            navigate("/");
            return;
        }
    
        fetchGudangDetail(token);
    }, [namaGudang, navigate, fetchGudangDetail]);

    const handleUpdateGudang = () => {
        navigate(`/gudang/update/${namaGudang}`);
    };

    const handleBack = () => {
        navigate('/gudang');
    };

    const formatDate = (dateString) => {
        const options = { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    if (loading) {
        return (
            <div className="gudang-detail-container">
                <div className="gudang-detail-content">
                    <div className="loading-container">
                        <div className="loading-text">Memuat detail gudang...</div>
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
                    <h1 className="page-title">{gudang.nama}</h1>
                </div>
                
                <div className="action-buttons">
                    <button className="back-btn" onClick={handleBack}>
                        Kembali
                    </button>
                    <button className="update-btn" onClick={handleUpdateGudang}>
                        Update Gudang
                    </button>
                </div>

                <div className="detail-card">
                    <div className="section-header">
                        <h2 className="section-title">Informasi Umum</h2>
                    </div>
                    <div className="section-content">
                        <div className="detail-row">
                            <span className="detail-label">Nama Gudang:</span>
                            <span className="detail-value">{gudang.nama}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Kapasitas:</span>
                            <span className="detail-value">{gudang.kapasitas}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Deskripsi:</span>
                            <span className="detail-value">{gudang.deskripsi || '-'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Tanggal Dibuat:</span>
                            <span className="detail-value">{formatDate(gudang.createdDate)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Terakhir Diperbarui:</span>
                            <span className="detail-value">{formatDate(gudang.updatedDate)}</span>
                        </div>
                    </div>
                </div>

                <div className="detail-card">
                    <div className="section-header">
                        <h2 className="section-title">Lokasi</h2>
                    </div>
                    <div className="section-content">
                        <div className="detail-row">
                            <span className="detail-label">Alamat:</span>
                            <span className="detail-value">{gudang.alamatGudang.alamat}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Kota:</span>
                            <span className="detail-value">{gudang.alamatGudang.kota}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Provinsi:</span>
                            <span className="detail-value">{gudang.alamatGudang.provinsi}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Kode Pos:</span>
                            <span className="detail-value">{gudang.alamatGudang.kodePos}</span>
                        </div>
                    </div>
                </div>

                <div className="detail-card">
                    <div className="section-header">
                        <h2 className="section-title">Kepala Gudang</h2>
                    </div>
                    <div className="section-content">
                        <div className="detail-row">
                            <span className="detail-label">Nama:</span>
                            <span className="detail-value">{gudang.kepalaGudang.name}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{gudang.kepalaGudang.email}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Business Phone:</span>
                            <span className="detail-value">{gudang.kepalaGudang.businessPhone}</span>
                        </div>
                    </div>
                </div>

                {gudang.listBarang && gudang.listBarang.length > 0 ? (
                    <div className="detail-card">
                        <div className="section-header">
                            <h2 className="section-title">Daftar Barang</h2>
                        </div>
                        <div className="section-content">
                            <table className="barang-table">
                                <thead>
                                    <tr>
                                        <th>Kode</th>
                                        <th>Nama</th>
                                        <th>Stok</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gudang.listBarang.map((barang) => (
                                        <tr key={barang.id || barang.kodeBarang}>
                                            <td>{barang.id || barang.kodeBarang}</td>
                                            <td>{barang.nama || barang.namaBarang}</td>
                                            <td>
                                                {barang.stockBarang?.find(sb => sb.namaGudang === gudang.nama)?.stock ?? 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="detail-section">
                        <h2>Daftar Barang</h2>
                        <div className="detail-item">
                            <span className="detail-value">Belum ada barang yang ditambahkan ke gudang ini</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GudangDetail;