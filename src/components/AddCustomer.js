import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AddEmployee.css"; // Reuse same style

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
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        let errors = {};
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
        setError("");
        if (!validateForm()) return;
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
                alert("Customer berhasil ditambahkan!");
                navigate("/customer");
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
        if (window.confirm("Apakah Anda yakin ingin membatalkan penambahan customer?"))
            navigate("/customer");
    };

    return (
        <div className="gudang-form-container">
            <div className="gudang-form-content">
                <div className="page-header">
                    <h1 className="page-title">Tambah Customer</h1>
                </div>

                <form onSubmit={handleSubmit} className="form-container">
                    <div className="form-section">

                        <div className="form-row">
                            <div className="form-group">
                                <label>Nama Perusahaan</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                                {validationErrors.email && <span className="error-message">{validationErrors.email}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>No. Telepon</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                                {validationErrors.phone && <span className="error-message">{validationErrors.phone}</span>}
                            </div>
                            <div className="form-group">
                                <label>No. Handphone</label>
                                <input type="text" name="handphone" value={formData.handphone} onChange={handleChange} required />
                                {validationErrors.handphone && <span className="error-message">{validationErrors.handphone}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>No. WhatsApp</label>
                                <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} required />
                                {validationErrors.whatsapp && <span className="error-message">{validationErrors.whatsapp}</span>}
                            </div>
                            <div className="form-group">
                                <label>Alamat</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} required>
                                <option value="">Pilih Role</option>
                                <option value="VENDOR">VENDOR</option>
                                <option value="CUSTOMER">CUSTOMER</option>
                            </select>
                            {validationErrors.role && <span className="error-message">{validationErrors.role}</span>}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={handleCancel}>Batal</button>
                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Simpan Customer"}
                        </button>
                    </div>
                </form>

                {showConfirmation && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Konfirmasi</h3>
                                <button className="close-button" onClick={() => setShowConfirmation(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <p>Apakah Anda yakin ingin menyimpan data customer ini?</p>
                            </div>
                            <div className="modal-footer">
                                <button className="cancel-btn" onClick={() => setShowConfirmation(false)}>Batal</button>
                                <button className="submit-btn" onClick={confirmSubmit}>Ya, Simpan</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddCustomer;
