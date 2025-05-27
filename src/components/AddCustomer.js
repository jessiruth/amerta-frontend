import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AddGoodsAndServices.css"; // Reuse same style

const AddCustomer = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        handphone: "",
        whatsapp: "",
        email: "",
        address: "",
        role: ""
    });

    const [, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) navigate("/");
    }, [navigate, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        let errors = {};
        ["name", "email", "phone", "handphone", "whatsapp", "address", "role"].forEach((field) => {
            if (!formData[field].trim()) {
                errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} wajib diisi.`;
            }
        });
        
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Format email tidak valid.";
        }
        ["phone", "handphone", "whatsapp"].forEach((field) => {
            if (formData[field] && !/^\d+$/.test(formData[field])) {
                errors[field] = "Harus berupa angka.";
            }
        });
        if (!formData.role) errors.role = "Role wajib dipilih.";
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setHasSubmitted(true);
        if (!validateForm()) {
        const firstError = document.querySelector('.barang-error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
        }
        setShowConfirmation(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        setShowConfirmation(false);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/customer/add`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if ([200, 201].includes(response.status)) {
                setShowSuccessModal(true);
            } else {
                setError("Gagal menambahkan customer. Silakan coba lagi.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Terjadi kesalahan. Periksa koneksi Anda.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setShowCancelConfirmation(true);
    };

    return (
        <div className="barang-form-container">
            <div className="barang-page-header">
                <h1 className="barang-page-title">Tambah Customer</h1>
            </div>
            <div className="barang-form-content">
                <form onSubmit={handleSubmit}>
                    <div className="barang-form-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nama Perusahaan<span className="required">*</span></label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} />
                                {hasSubmitted && validationErrors.name && <div className="barang-error">{validationErrors.name}</div>}
                            </div>
                            <div className="form-group">
                                <label>Email<span className="required">*</span></label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                                {hasSubmitted && validationErrors.email && <div className="barang-error">{validationErrors.email}</div>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>No. Telepon<span className="required">*</span></label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                                {hasSubmitted && validationErrors.phone && <div className="barang-error">{validationErrors.phone}</div>}
                            </div>
                            <div className="form-group">
                                <label>No. Handphone<span className="required">*</span></label>
                                <input type="text" name="handphone" value={formData.handphone} onChange={handleChange} />
                                {hasSubmitted && validationErrors.handphone && <div className="barang-error">{validationErrors.handphone}</div>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>No. WhatsApp<span className="required">*</span></label>
                                <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
                                {hasSubmitted && validationErrors.whatsapp && <div className="barang-error">{validationErrors.whatsapp}</div>}
                            </div>
                            <div className="form-group">
                                <label>Alamat<span className="required">*</span></label>
                                <textarea name="address" value={formData.address} onChange={handleChange} />
                                {hasSubmitted && validationErrors.address && <div className="barang-error">{validationErrors.address}</div>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Role<span className="required">*</span></label>
                            <select name="role" value={formData.role} onChange={handleChange} >
                                <option value="">Pilih Role</option>
                                <option value="VENDOR">VENDOR</option>
                                <option value="CUSTOMER">CUSTOMER</option>
                            </select>
                            {hasSubmitted && validationErrors.role && <div className="barang-error">{validationErrors.role}</div>}
                        </div>
                    </div>

                    <div className="barang-actions">
                        <button type="button" className="barang-cancel-btn" onClick={handleCancel}>Batal</button>
                        <button type="submit" className="barang-submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Simpan Customer"}
                        </button>
                    </div>
                </form>
            </div>

            {showConfirmation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Konfirmasi Simpan</h3>
                            <button className="close-button" onClick={() => setShowConfirmation(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>Apakah Anda yakin ingin menyimpan customer ini?</p>
                        </div>
                        <div className="modal-footer">
                            <button className="secondary-btn" onClick={() => setShowConfirmation(false)}>Kembali</button>
                            <button className="primary-btn" onClick={confirmSubmit}>Ya, Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {showCancelConfirmation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Konfirmasi Batal</h3>
                            <button className="close-button" onClick={() => setShowCancelConfirmation(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>Apakah Anda yakin ingin membatalkan penambahan customer?</p>
                            <p className="warning-text">Semua data yang telah dimasukkan akan hilang.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="secondary-btn" onClick={() => setShowCancelConfirmation(false)}>Kembali</button>
                            <button className="danger-btn" onClick={() => navigate("/customer")}>Ya, Batalkan</button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Customer Ditambahkan</h3>
                            <button className="close-button" onClick={() => setShowSuccessModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>Customer berhasil ditambahkan. Anda akan diarahkan ke halaman customer.</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="primary-btn"
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    navigate("/customer");
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddCustomer;