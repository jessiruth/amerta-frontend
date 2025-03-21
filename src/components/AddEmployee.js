import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AddEmployee.css";

const AddEmployee = () => {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        gender: "true",
        phone: "",
        homePhone: "",
        businessPhone: "",
        whatsappNumber: "",
        entryDate: new Date().toISOString().split("T")[0],
        ktpNumber: "",
        notes: "",
        role: ""
    });

    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    };

    const validateForm = () => {
        let errors = {};

        if (!/^\d{16}$/.test(formData.ktpNumber)) {
            errors.ktpNumber = "KTP harus 16 digit angka.";
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Format email tidak valid.";
        }

        if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(formData.password)) {
            errors.password = "Password harus minimal 8 karakter, mengandung huruf dan angka.";
        }

        ["phone", "homePhone", "businessPhone", "whatsappNumber"].forEach((field) => {
            if (formData[field] && !/^\d+$/.test(formData[field])) {
                errors[field] = "Nomor telepon harus berupa angka.";
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) {
            return;
        }

        setShowConfirmation(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        setShowConfirmation(false);

        try {
            const payload = {
                ...formData,
                gender: formData.gender === "true",
                entryDate: `${formData.entryDate}T00:00:00`,
            };

            const response = await axios.post("http://localhost:8080/api/user/register", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200 || response.status === 201) {
                alert("Karyawan berhasil ditambahkan!");
                navigate("/employee");
            } else {
                setError("Gagal menambahkan karyawan. Silakan coba lagi.");
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || "Terjadi kesalahan saat menambahkan karyawan.");
            } else {
                setError("Terjadi kesalahan. Periksa koneksi Anda.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm("Apakah Anda yakin ingin membatalkan penambahan karyawan?")) {
            navigate("/employee");
        }
    };

    return (
        <div className="add-employee-container">
            <div className="form-box">
                <h1 className="page-title">Add Employee</h1>

                {error && <p className="error">{error}</p>}

                <form onSubmit={handleSubmit} className="add-employee-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label><b>Nama</b></label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label><b>Username</b></label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><b>Email</b></label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                            {validationErrors.email && <p className="error">{validationErrors.email}</p>}
                        </div>

                        <div className="form-group">
                            <label><b>Password</b></label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                            {validationErrors.password && <p className="error">{validationErrors.password}</p>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label><b>Jenis Kelamin</b></label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required>
                            <option value="true">Laki-laki</option>
                            <option value="false">Perempuan</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label><b>No. KTP</b></label>
                        <input type="text" name="ktpNumber" value={formData.ktpNumber} onChange={handleChange} required />
                        {validationErrors.ktpNumber && <p className="error">{validationErrors.ktpNumber}</p>}
                    </div>

                    <div className="form-group">
                        <label><b>No. Handphone</b></label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                        {validationErrors.phone && <p className="error">{validationErrors.phone}</p>}
                    </div>

                    <div className="form-group">
                        <label><b>No. WhatsApp</b></label>
                        <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label><b>No. Telepon Rumah</b></label>
                        <input type="text" name="homePhone" value={formData.homePhone} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label><b>No. Telepon Kantor</b></label>
                        <input type="text" name="businessPhone" value={formData.businessPhone} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label><b>Role</b></label>
                        <select name="role" value={formData.role} onChange={handleChange} required>
                            <option value="">Pilih Role</option>
                            <option value="Sales">Sales</option>
                            <option value="Administrasi">Administrasi</option>
                            <option value="Kepala Gudang">Kepala Gudang</option>
                            <option value="General Manager">General Manager</option>
                            <option value="Direktur">Direktur</option>
                            <option value="Komisaris">Komisaris</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label><b>Catatan</b></label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} required />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-button" onClick={handleCancel}>Batal</button>
                        <button type="submit" className="submit-button" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Simpan Karyawan"}
                        </button>
                    </div>
                </form>
            </div>
            {showConfirmation && (
                <div className="confirmation-overlay">
                    <div className="confirmation-dialog">
                        <h3>Konfirmasi Penambahan Karyawan</h3>
                        <p>Pastikan data yang Anda masukkan sudah benar sebelum menyimpan.</p>
                        <div className="confirmation-actions">
                            <button className="cancel-button" onClick={() => setShowConfirmation(false)}>Batal</button>
                            <button className="confirm-button" onClick={confirmSubmit} disabled={isSubmitting}>
                                {isSubmitting ? "Menyimpan..." : "Konfirmasi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddEmployee;
