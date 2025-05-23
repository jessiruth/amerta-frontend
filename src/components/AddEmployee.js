import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AddGoodsAndServices.css";

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    name: "", username: "", email: "", password: "", gender: "true",
    phone: "", homePhone: "", businessPhone: "", whatsappNumber: "",
    entryDate: new Date().toISOString().split("T")[0],
    birthDate: "", status: "true",
    ktpNumber: "", notes: "", role: ""
  });

  const [, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
    if (!/^\d{16}$/.test(formData.ktpNumber)) errors.ktpNumber = "KTP harus 16 digit angka.";
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Format email tidak valid.";
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(formData.password)) errors.password = "Password harus minimal 8 karakter, mengandung huruf dan angka.";
    ["phone", "homePhone", "businessPhone", "whatsappNumber"].forEach((field) => {
      if (formData[field] && !/^\d+$/.test(formData[field])) errors[field] = "Harus berupa angka.";
    });
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
      const payload = {
        ...formData,
        gender: formData.gender === "true",
        status: formData.status === "true",
        entryDate: `${formData.entryDate}T00:00:00`,
        birthDate: `${formData.birthDate}T00:00:00`
      };

      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/user/register`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if ([200, 201].includes(response.status)) {
        setShowSuccessModal(true);
      } else {
        setError("Gagal menambahkan karyawan. Silakan coba lagi.");
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
        <h1 className="barang-page-title">Tambah Karyawan</h1>
      </div>
      <div className="barang-form-content">
        <form onSubmit={handleSubmit}>
          <div className="barang-form-section">
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
                {validationErrors.email && <div className="barang-error">{validationErrors.email}</div>}
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                {validationErrors.password && <div className="barang-error">{validationErrors.password}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Jenis Kelamin</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="true">Laki-laki</option>
                  <option value="false">Perempuan</option>
                </select>
              </div>
              <div className="form-group">
                <label>No. KTP</label>
                <input type="text" name="ktpNumber" value={formData.ktpNumber} onChange={handleChange} required />
                {validationErrors.ktpNumber && <div className="barang-error">{validationErrors.ktpNumber}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>No. Handphone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                {validationErrors.phone && <div className="barang-error">{validationErrors.phone}</div>}
              </div>
              <div className="form-group">
                <label>No. WhatsApp</label>
                <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>No. Telepon Rumah</label>
                <input type="text" name="homePhone" value={formData.homePhone} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>No. Telepon Bisnis</label>
                <input type="text" name="businessPhone" value={formData.businessPhone} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tanggal Lahir</label>
                <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Status Karyawan</label>
                <div className="barang-radio-group">
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="true"
                      checked={formData.status === "true"}
                      onChange={handleChange}
                    /> Aktif
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="false"
                      checked={formData.status === "false"}
                      onChange={handleChange}
                    /> Tidak Aktif
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="">Pilih Role</option>
                <option value="Sales">Sales</option>
                <option value="Administrasi">Administrasi</option>
                <option value="Kepala_Gudang">Kepala Gudang</option>
                <option value="General_Manager">General Manager</option>
                <option value="Direktur">Direktur</option>
                <option value="Komisaris">Komisaris</option>
              </select>
            </div>

            <div className="form-group">
              <label>Catatan</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} required />
            </div>
          </div>

          <div className="barang-actions">
            <button type="button" className="barang-cancel-btn" onClick={handleCancel}>Batal</button>
            <button type="submit" className="barang-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Karyawan"}
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
              <p>Apakah Anda yakin ingin menyimpan karyawan ini?</p>
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
              <p>Apakah Anda yakin ingin membatalkan penambahan karyawan?</p>
              <p className="warning-text">Semua data yang telah dimasukkan akan hilang.</p>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowCancelConfirmation(false)}>Kembali</button>
              <button className="danger-btn" onClick={() => navigate("/employee")}>Ya, Batalkan</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Karyawan Ditambahkan</h3>
              <button className="close-button" onClick={() => setShowSuccessModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Karyawan berhasil ditambahkan. Anda akan diarahkan ke halaman employee.</p>
            </div>
            <div className="modal-footer">
              <button
                className="primary-btn"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/employee");
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

export default AddEmployee;