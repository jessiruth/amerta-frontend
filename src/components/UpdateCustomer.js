import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/AddEmployee.css";
import Navbar from "./Navbar";

const UpdateCustomer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [confirmationType, setConfirmationType] = useState('save');

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        handphone: "",
        whatsapp: "",
        email: "",
        address: "",
        role: ""
    });

    const [validationErrors, setValidationErrors] = useState({});
    const token = localStorage.getItem("token");

    const fetchCustomerData = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/customer/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.data) {
                const customerData = response.data.data;
                setFormData({
                    name: customerData.name || "",
                    phone: customerData.phone || "",
                    handphone: customerData.handphone || "",
                    whatsapp: customerData.whatsapp || "",
                    email: customerData.email || "",
                    address: customerData.address || "",
                    role: customerData.role || ""
                });
            }
        } catch (error) {
            console.error('Error fetching customer data:', error);
            alert('Gagal memuat data customer');
            navigate('/customer');
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = "Nama harus diisi";
        if (!formData.phone.trim()) errors.phone = "Nomor telepon harus diisi";
        if (!formData.handphone.trim()) errors.handphone = "Nomor handphone harus diisi";
        if (!formData.whatsapp.trim()) errors.whatsapp = "Nomor WhatsApp harus diisi";
        if (!formData.email.trim()) errors.email = "Email harus diisi";
        if (!formData.address.trim()) errors.address = "Alamat harus diisi";

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Format email tidak valid";
        }

        ["phone", "handphone", "whatsapp"].forEach((field) => {
            if (formData[field] && !/^\d+$/.test(formData[field])) {
                errors[field] = "Harus berupa angka";
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setConfirmationType('save');
            setShowConfirmation(true);
        } else {
            const firstError = document.querySelector('.error-message');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const confirmSubmit = async () => {
        setSaving(true);
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/api/customer/update/${id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                setShowConfirmation(false);
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('Error updating customer:', error);
            alert(error.response?.data?.message || 'Gagal memperbarui customer');
        } finally {
            setSaving(false);
            setShowConfirmation(false);
        }
    };

    const handleCancel = () => {
        setConfirmationType('cancel');
        setShowConfirmation(true);
    };

    if (loading) {
        return (
            <div className="gudang-form-container">
                <Navbar />
                <div className="gudang-form-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <h3 className="loading-text">Memuat data customer...</h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="gudang-form-container">
            <Navbar />
            <div className="gudang-form-content">
                <div className="page-header">
                    <h1 className="page-title" style={{ color: '#f7931e' }}>Update Customer</h1>
                </div>

                <form onSubmit={handleSubmit} className="form-container">
                    <div className="form-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nama Perusahaan<span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={validationErrors.name ? "error-input" : ""}
                                    required
                                />
                                {validationErrors.name && <span className="error-message">{validationErrors.name}</span>}
                            </div>
                            <div className="form-group">
                                <label>Email<span className="required">*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={validationErrors.email ? "error-input" : ""}
                                    required
                                />
                                {validationErrors.email && <span className="error-message">{validationErrors.email}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>No. Telepon<span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={validationErrors.phone ? "error-input" : ""}
                                    required
                                />
                                {validationErrors.phone && <span className="error-message">{validationErrors.phone}</span>}
                            </div>
                            <div className="form-group">
                                <label>No. Handphone<span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="handphone"
                                    value={formData.handphone}
                                    onChange={handleChange}
                                    className={validationErrors.handphone ? "error-input" : ""}
                                    required
                                />
                                {validationErrors.handphone && <span className="error-message">{validationErrors.handphone}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>No. WhatsApp<span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={handleChange}
                                    className={validationErrors.whatsapp ? "error-input" : ""}
                                    required
                                />
                                {validationErrors.whatsapp && <span className="error-message">{validationErrors.whatsapp}</span>}
                            </div>
                            <div className="form-group">
                                <label>Alamat<span className="required">*</span></label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className={validationErrors.address ? "error-input" : ""}
                                    required
                                />
                                {validationErrors.address && <span className="error-message">{validationErrors.address}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Role</label>
                            <input
                                type="text"
                                name="role"
                                value={formData.role}
                                readOnly
                                className="readonly-input"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={handleCancel}>Batal</button>
                        <button type="submit" className="submit-btn" disabled={saving}>
                            {saving ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>

                {showConfirmation && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            {saving ? (
                                <>
                                    <div className="modal-header">
                                        <h3>Menyimpan Data</h3>
                                    </div>
                                    <div className="modal-body">
                                        <div className="loading-indicator">
                                            <div className="loading-spinner"></div>
                                            <p>Sedang menyimpan data customer...</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="modal-header">
                                        <h3>{confirmationType === 'save' ? 'Konfirmasi Perubahan' : 'Konfirmasi Batal'}</h3>
                                        <button className="close-button" onClick={() => setShowConfirmation(false)}>&times;</button>
                                    </div>
                                    <div className="modal-body">
                                        {confirmationType === 'save' ? (
                                            <p>Apakah Anda yakin ingin menyimpan perubahan pada customer "{formData.name}"?</p>
                                        ) : (
                                            <>
                                                <p>Apakah Anda yakin ingin membatalkan perubahan?</p>
                                                <p className="warning-text">Semua perubahan yang telah dilakukan akan hilang.</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="modal-footer">
                                        <button className="secondary-btn" onClick={() => setShowConfirmation(false)}>Kembali</button>
                                        <button
                                            className={confirmationType === 'save' ? "primary-btn" : "danger-btn"}
                                            onClick={confirmationType === 'save'
                                                ? confirmSubmit
                                                : () => navigate('/customer')}
                                        >
                                            {confirmationType === 'save' ? "Ya, Perbarui" : "Ya, Batalkan"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {showSuccessModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Customer Diupdate</h3>
                                <button className="close-button" onClick={() => setShowSuccessModal(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <p>Customer berhasil diupdate. Anda akan diarahkan ke detail customer.</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="primary-btn"
                                    onClick={() => navigate(`/customer/${id}`)}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpdateCustomer; 