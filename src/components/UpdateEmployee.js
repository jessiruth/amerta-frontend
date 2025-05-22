import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import axiosInstance from '../services/axiosInstance';
import '../styles/Employee.css';

const UpdateEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmationType, setConfirmationType] = useState('save');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    homePhone: '',
    businessPhone: '',
    whatsappNumber: '',
    notes: '',
    employeeStatus: true,
    role: ''
  });
  const [readOnlyData, setReadOnlyData] = useState({
    name: '',
    gender: '',
    entryDate: '',
    ktpNumber: '',
    birthDate: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  const fetchEmployeeData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/api/user/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.data) {
        const employeeData = response.data.data;
        setFormData({
          email: employeeData.email || '',
          phone: employeeData.phone || '',
          homePhone: employeeData.homePhone || '',
          businessPhone: employeeData.businessPhone || '',
          whatsappNumber: employeeData.whatsappNumber || '',
          notes: employeeData.notes || '',
          employeeStatus: employeeData.employeeStatus,
          role: employeeData.role || ''
        });
        setReadOnlyData({
          name: employeeData.name || '',
          gender: employeeData.gender ? 'Laki-laki' : 'Perempuan',
          entryDate: employeeData.entryDate ? new Date(employeeData.entryDate).toLocaleDateString('id-ID') : '',
          ktpNumber: employeeData.ktpNumber || '',
          birthDate: employeeData.birthDate ? new Date(employeeData.birthDate).toLocaleDateString('id-ID') : ''
        });
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      toast.error('Gagal memuat data karyawan');
      setTimeout(() => navigate('/employee'), 2000);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchEmployeeData();
  }, [navigate, fetchEmployeeData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = "Email harus diisi";
    if (!formData.phone.trim()) errors.phone = "Nomor telepon harus diisi";
    if (!formData.homePhone.trim()) errors.homePhone = "Nomor telepon rumah harus diisi";
    if (!formData.businessPhone.trim()) errors.businessPhone = "Nomor telepon bisnis harus diisi";
    if (!formData.whatsappNumber.trim()) errors.whatsappNumber = "Nomor WhatsApp harus diisi";
    if (!formData.role.trim()) errors.role = "Role harus diisi";
    if (formData.phone && !/^\d+$/.test(formData.phone)) errors.phone = "Harus berupa angka";
    if (formData.homePhone && !/^\d+$/.test(formData.homePhone)) errors.homePhone = "Harus berupa angka";
    if (formData.businessPhone && !/^\d+$/.test(formData.businessPhone)) errors.businessPhone = "Harus berupa angka";
    if (formData.whatsappNumber && !/^\d+$/.test(formData.whatsappNumber)) errors.whatsappNumber = "Harus berupa angka";
    if (formData.notes && formData.notes.length > 500) errors.notes = "Catatan maksimal 500 karakter";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Format email tidak valid";
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
      const token = localStorage.getItem("token");
      const response = await axiosInstance.put(
        `/api/user/update/${id}`,
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
      console.error('Error updating employee:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui karyawan.');
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
      <div className="employee-form-container">
        <Navbar />
        <div className="employee-form-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h3 className="loading-text">Memuat data karyawan...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-form-container">
      <Navbar />
      <div className="employee-form-content">
        <div className="page-header">
          <h1 className="page-title" style={{ color: '#f7931e' }}>Update Karyawan</h1>
        </div>
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-section">
            <div className="form-row">
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
              <div className="form-group">
                <label>Nomor Telepon<span className="required">*</span></label>
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
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Nomor Telepon Rumah<span className="required">*</span></label>
                <input
                  type="text"
                  name="homePhone"
                  value={formData.homePhone}
                  onChange={handleChange}
                  className={validationErrors.homePhone ? "error-input" : ""}
                  required
                />
                {validationErrors.homePhone && <span className="error-message">{validationErrors.homePhone}</span>}
              </div>
              <div className="form-group">
                <label>Nomor Telepon Bisnis<span className="required">*</span></label>
                <input
                  type="text"
                  name="businessPhone"
                  value={formData.businessPhone}
                  onChange={handleChange}
                  className={validationErrors.businessPhone ? "error-input" : ""}
                  required
                />
                {validationErrors.businessPhone && <span className="error-message">{validationErrors.businessPhone}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Nomor WhatsApp<span className="required">*</span></label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  className={validationErrors.whatsappNumber ? "error-input" : ""}
                  required
                />
                {validationErrors.whatsappNumber && <span className="error-message">{validationErrors.whatsappNumber}</span>}
              </div>
              <div className="form-group">
                <label>Role<span className="required">*</span></label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={validationErrors.role ? "error-input" : ""}
                  required
                >
                  <option value="">Pilih Role</option>
                  <option value="administrasi">Administrasi</option>
                  <option value="direktur">Direktur</option>
                  <option value="sales">Sales</option>
                  <option value="general_manager">General Manager</option>
                  <option value="kepala_gudang">Kepala Gudang</option>
                  <option value="komisaris">Komisaris</option>
                </select>
                {validationErrors.role && <span className="error-message">{validationErrors.role}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Catatan</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className={validationErrors.notes ? "error-input" : ""}
                  rows="3"
                  maxLength={500}
                />
                {validationErrors.notes && <span className="error-message">{validationErrors.notes}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status Karyawan</label>
                <div className="radio-group-horizontal">
                  <label style={{ marginRight: '2rem' }}>
                    <input
                      type="radio"
                      name="employeeStatus"
                      value="true"
                      checked={formData.employeeStatus === true}
                      onChange={() => setFormData((prev) => ({ ...prev, employeeStatus: true }))}
                    />
                    Aktif
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="employeeStatus"
                      value="false"
                      checked={formData.employeeStatus === false}
                      onChange={() => setFormData((prev) => ({ ...prev, employeeStatus: false }))}
                    />
                    Tidak Aktif
                  </label>
                </div>
              </div>
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
                      <p>Sedang menyimpan data karyawan...</p>
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
                      <p>Apakah Anda yakin ingin menyimpan perubahan pada karyawan "{readOnlyData.name}"?</p>
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
                        : () => navigate(`/employee/${id}`)}
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
                <h3>Karyawan Diupdate</h3>
                <button className="close-button" onClick={() => setShowSuccessModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <p>Data karyawan berhasil diupdate. Anda akan diarahkan ke detail karyawan.</p>
              </div>
              <div className="modal-footer">
                <button
                  className="primary-btn"
                  onClick={() => navigate(`/employee/${id}`)}
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

export default UpdateEmployee; 