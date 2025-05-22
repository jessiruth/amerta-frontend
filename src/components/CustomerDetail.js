import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/GudangDetail.css";
import Navbar from "./Navbar";

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState(null);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    const fetchCustomerData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/customer/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.data) {
                setCustomer(response.data.data);
            } else {
                setError('Data customer tidak ditemukan.');
            }
        } catch (error) {
            console.error('Error fetching customer data:', error);
            if (error.response && error.response.status === 403) {
                setError('Anda tidak memiliki akses untuk melihat detail customer');
                setTimeout(() => navigate('/customer'), 2000);
            } else {
                setError('Gagal memuat detail customer. Silakan coba lagi nanti.');
            }
        } finally {
            setLoading(false);
        }
    }, [id, token, navigate]);

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }
        fetchCustomerData();
    }, [token, navigate, fetchCustomerData]);

    const handleUpdateCustomer = () => {
        navigate(`/customer/update/${id}`);
    };

    const handleBack = () => {
        navigate('/customer');
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
                <Navbar />
                <div className="gudang-detail-content">
                    <div className="loading-container">
                        <div className="loading-text">Memuat detail customer/vendor...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="gudang-detail-container">
                <Navbar />
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
            <Navbar />
            <div className="gudang-detail-content">
                <div className="page-header">
                    <h1 className="page-title">{customer.name}</h1>
                </div>
                
                <div className="action-buttons">
                    <button className="back-btn" onClick={handleBack}>
                        Kembali
                    </button>
                    <button className="update-btn" onClick={handleUpdateCustomer}>
                        Update Customer/Vendor
                    </button>
                </div>

                <div className="detail-card">
                    <div className="section-header">
                        <h2 className="section-title">Informasi Umum</h2>
                    </div>
                    <div className="section-content">
                        <div className="detail-row">
                            <span className="detail-label">Nama Customer/Vendor:</span>
                            <span className="detail-value">{customer.name}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{customer.email}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Alamat:</span>
                            <span className="detail-value">{customer.address}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Role:</span>
                            <span className="detail-value">{customer.role}</span>
                        </div>
                    </div>
                </div>

                <div className="detail-card">
                    <div className="section-header">
                        <h2 className="section-title">Kontak</h2>
                    </div>
                    <div className="section-content">
                        <div className="detail-row">
                            <span className="detail-label">No. Telepon:</span>
                            <span className="detail-value">{customer.phone}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">No. Handphone:</span>
                            <span className="detail-value">{customer.handphone}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">No. WhatsApp:</span>
                            <span className="detail-value">{customer.whatsapp}</span>
                        </div>
                    </div>
                </div>

                {customer.createdDate && (
                    <div className="detail-card">
                        <div className="section-header">
                            <h2 className="section-title">Informasi Sistem</h2>
                        </div>
                        <div className="section-content">
                            <div className="detail-row">
                                <span className="detail-label">Tanggal Dibuat:</span>
                                <span className="detail-value">{formatDate(customer.createdDate)}</span>
                            </div>
                            {customer.updatedDate && (
                                <div className="detail-row">
                                    <span className="detail-label">Terakhir Diperbarui:</span>
                                    <span className="detail-value">{formatDate(customer.updatedDate)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDetail; 