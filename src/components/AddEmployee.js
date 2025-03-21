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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

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
                <h2>Tambah Karyawan</h2>
                <p className="subtitle">Isi form di bawah untuk menambahkan karyawan baru ke sistem.</p>

                {error && <p className="error">{error}</p>}

                <form onSubmit={handleSubmit} className="add-employee-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nama</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Username</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Jenis Kelamin</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required>
                            <option value="true">Laki-laki</option>
                            <option value="false">Perempuan</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>No. Handphone</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>No. WhatsApp</label>
                            <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Tanggal Masuk</label>
                            <input type="date" name="entryDate" value={formData.entryDate} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>No. KTP</label>
                            <input type="text" name="ktpNumber" value={formData.ktpNumber} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Role</label>
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

                    <div className="form-actions">
                        <button type="button" className="cancel-button" onClick={handleCancel}>
                            Batal
                        </button>
                        <button type="submit" className="submit-button" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Simpan Karyawan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployee;
