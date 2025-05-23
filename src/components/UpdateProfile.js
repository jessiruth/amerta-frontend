import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import axiosInstance from '../services/axiosInstance';
import '../styles/AddGoodsAndServices.css';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const id = localStorage.getItem("id");
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const validateForm = () => {
    const errors = {};
    if (!oldPassword.trim()) errors.oldPassword = "Password lama wajib diisi.";
    if (!newPassword.trim()) errors.newPassword = "Password baru wajib diisi.";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmation(true);
    } else {
      const firstError = document.querySelector('.barang-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const confirmSubmit = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.put(
        `/api/user/update-profile/${id}`,
        { oldPassword, password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setShowConfirmation(false);
        setShowSuccessModal(true);
        setValidationErrors({});
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Gagal memperbarui password.";
      const errors = {};
      if (errorMsg.toLowerCase().includes("password lama tidak sesuai")) {
        errors.oldPassword = "Password lama tidak sesuai.";
      } else {
        errors.general = errorMsg;
      }
      setValidationErrors(errors);
      setShowConfirmation(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="barang-form-container">
      <Navbar />
      <div className="barang-page-header">
        <h1 className="barang-page-title">Update Password</h1>
      </div>
      <div className="barang-form-content">
        <form onSubmit={handleSubmit}>
          <div className="barang-form-section">
            <div className="barang-form-group">
              <label>Password Lama<span className="required">*</span></label>
              <div className="password-input-wrapper">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <span onClick={() => setShowOldPassword(!showOldPassword)} className="eye-icon">
                  {showOldPassword ? <VisibilityOff /> : <Visibility />}
                </span>
              </div>
              {validationErrors.oldPassword && <div className="barang-error">{validationErrors.oldPassword}</div>}
            </div>

            <div className="barang-form-group">
              <label>Password Baru<span className="required">*</span></label>
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <span onClick={() => setShowNewPassword(!showNewPassword)} className="eye-icon">
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </span>
              </div>
              {validationErrors.newPassword && <div className="barang-error">{validationErrors.newPassword}</div>}
            </div>

            {validationErrors.general && <div className="barang-error">{validationErrors.general}</div>}
          </div>

          <div className="barang-actions">
            <button type="button" className="barang-cancel-btn" onClick={() => navigate("/home")}>Batal</button>
            <button type="submit" className="barang-submit-btn" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal Konfirmasi */}
      {showConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Konfirmasi Perubahan Password</h3>
              <button className="close-button" onClick={() => setShowConfirmation(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Apakah Anda yakin ingin memperbarui password?</p>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowConfirmation(false)}>Kembali</button>
              <button className="primary-btn" onClick={confirmSubmit}>Ya, Perbarui</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Password Diupdate</h3>
              <button className="close-button" onClick={() => setShowSuccessModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Password Anda berhasil diperbarui.</p>
            </div>
            <div className="modal-footer">
              <button className="primary-btn" onClick={() => navigate("/home")}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateProfile;