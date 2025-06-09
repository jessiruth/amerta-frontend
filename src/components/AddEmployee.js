import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AddGoodsAndServices.css";

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    name: "", username: "", email: "", password: "", gender: "true",
    phone: "", homePhone: "", businessPhone: "", whatsappNumber: "",
    entryDate: new Date().toISOString().split("T")[0],
    birthDate: "", employeeStatus: "",
    ktpNumber: "", notes: "", role: ""
  });

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

    if (!formData.name.trim()) errors.name = "Nama wajib diisi.";
    if (!formData.username.trim()) errors.username = "Username wajib diisi.";
    if (!formData.email.trim()) {
      errors.email = "Email wajib diisi.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Format email tidak valid.";
    }

    if (!formData.password.trim()) {
      errors.password = "Password wajib diisi.";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(formData.password)) {
      errors.password = "Password harus minimal 8 karakter, mengandung huruf dan angka.";
    }

    if (!formData.ktpNumber.trim()) {
      errors.ktpNumber = "KTP wajib diisi";
    } else if (!/^\d{16}$/.test(formData.ktpNumber)) {
      errors.ktpNumber = "KTP harus 16 digit angka.";
    }

    if (!formData.phone.trim()) {
      errors.phone = "No. Handphone wajib diisi.";
    } else if (!/^\d+$/.test(formData.phone)) {
      errors.phone = "No. Handphone harus berupa angka.";
    }

    if (!formData.homePhone.trim()) {
      errors.homePhone = "No. Telepon Rumah wajib diisi.";
    } else if (!/^\d+$/.test(formData.homePhone)) {
      errors.homePhone = "No. Telepon Rumah harus berupa angka.";
    }

    if (!formData.businessPhone.trim()) {
      errors.businessPhone = "No. Telepon Bisnis wajib diisi.";
    } else if (!/^\d+$/.test(formData.businessPhone)) {
      errors.businessPhone = "No. Telepon Bisnis harus berupa angka.";
    }

    if (!formData.whatsappNumber.trim()) {
      errors.whatsappNumber = "No. WhatsApp wajib diisi.";
    } else if (!/^\d+$/.test(formData.whatsappNumber)) {
      errors.whatsappNumber = "No. WhatsApp harus berupa angka.";
    }

    if (!formData.birthDate.trim()) {
      errors.birthDate = "Tanggal lahir wajib diisi.";
    } else {
      const today = new Date().toISOString().split("T")[0];
      if (formData.birthDate > today) {
        errors.birthDate = "Tanggal lahir tidak boleh lebih dari hari ini.";
      }
    }

    if (!formData.role.trim()) errors.role = "Role wajib dipilih.";
    if (!formData.employeeStatus.trim()) errors.employeeStatus = "Status wajib dipilih.";
    if (!formData.notes.trim()) errors.notes = "Catatan wajib diisi.";

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
      const payload = {
        ...formData,
        gender: formData.gender === "true",
        employeeStatus: formData.employeeStatus === "true",
        entryDate: `${formData.entryDate}T00:00:00`,
        birthDate: `${formData.birthDate}T00:00:00`
      };

      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/user/register`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if ([200, 201].includes(response.status)) {
        setShowSuccessModal(true);
      } else {
        setValidationErrors({ general: "Gagal menambahkan karyawan. Silakan coba lagi." });
      }
    } catch (err) {
      setValidationErrors({ general: err.response?.data?.message || "Terjadi kesalahan. Periksa koneksi Anda." });
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
                <label>Nama<span className="required">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}/>
                {hasSubmitted && validationErrors.name && <div className="barang-error">{validationErrors.name}</div>}
              </div>
              <div className="form-group">
                <label>Username<span className="required">*</span></label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} />
                {hasSubmitted && validationErrors.username && <div className="barang-error">{validationErrors.username}</div>}
              </div>
            </div>

              <div className="barang-form-group">
                <label>Email<span className="required">*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                {hasSubmitted && validationErrors.email && <div className="barang-error">{validationErrors.email}</div>}
              </div>
              <div className="barang-form-group">
                <label>Password<span className="required">*</span></label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} />
                {hasSubmitted && validationErrors.password && <div className="barang-error">{validationErrors.password}</div>}
              </div>

            <div className="form-row">
              <div className="form-group">
                <label>Jenis Kelamin<span className="required">*</span></label>
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="true">Laki-laki</option>
                  <option value="false">Perempuan</option>
                </select>
              </div>
              <div className="form-group">
                <label>No. KTP<span className="required">*</span></label>
                <input type="text" name="ktpNumber" value={formData.ktpNumber} onChange={handleChange} />
                {hasSubmitted && validationErrors.ktpNumber && <div className="barang-error">{validationErrors.ktpNumber}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>No. Handphone<span className="required">*</span></label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                {hasSubmitted && validationErrors.phone && <div className="barang-error">{validationErrors.phone}</div>}
              </div>
              <div className="form-group">
                <label>No. WhatsApp<span className="required">*</span></label>
                <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} />
                {hasSubmitted && validationErrors.whatsappNumber && <div className="barang-error">{validationErrors.whatsappNumber}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>No. Telepon Rumah<span className="required">*</span></label>
                <input type="text" name="homePhone" value={formData.homePhone} onChange={handleChange} />
                {hasSubmitted && validationErrors.homePhone && <div className="barang-error">{validationErrors.homePhone}</div>}
              </div>
              <div className="form-group">
                <label>No. Telepon Bisnis<span className="required">*</span></label>
                <input type="text" name="businessPhone" value={formData.businessPhone} onChange={handleChange} />
                {hasSubmitted && validationErrors.businessPhone && <div className="barang-error">{validationErrors.businessPhone}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="barang-form-group">
                <label>Tanggal Lahir<span className="required">*</span></label>
                <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
                {hasSubmitted && validationErrors.birthDate && <div className="barang-error">{validationErrors.birthDate}</div>}
              </div>
              <div className="barang-form-group">
                <label>Status Karyawan<span className="required">*</span></label>
                <div className="barang-radio-group">
                  <label>
                    <input
                      type="radio"
                      name="employeeStatus"
                      value="true"
                      checked={formData.employeeStatus === "true"}
                      onChange={handleChange}
                    /> Aktif
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="employeeStatus"
                      value="false"
                      checked={formData.employeeStatus === "false"}
                      onChange={handleChange}
                    /> Tidak Aktif
                  </label>
                </div>
                {hasSubmitted && validationErrors.employeeStatus && <div className="barang-error">{validationErrors.employeeStatus}</div>}
              </div>
            </div>

            <div className="form-group">
              <label>Role<span className="required">*</span></label>
              <select name="role" value={formData.role} onChange={handleChange} >
                <option value="">Pilih Role</option>
                <option value="Sales">Sales</option>
                <option value="Administrasi">Administrasi</option>
                <option value="Kepala_Gudang">Kepala Gudang</option>
                <option value="General_Manager">General Manager</option>
                <option value="Direktur">Direktur</option>
                <option value="Komisaris">Komisaris</option>
              </select>
              {hasSubmitted && validationErrors.role && <div className="barang-error">{validationErrors.role}</div>}
            </div>

            <div className="form-group">
              <label>Catatan<span className="required">*</span></label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} />
              {hasSubmitted && validationErrors.notes && <div className="barang-error">{validationErrors.notes}</div>}
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