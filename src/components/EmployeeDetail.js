import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import axiosInstance from '../services/axiosInstance';
import '../styles/Employee.css';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [error, setError] = useState(null);

  const fetchEmployeeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/api/user/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.data) {
        setEmployeeData(response.data.data);
      } else {
        setError('Data karyawan tidak ditemukan.');
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setError('Anda tidak memiliki akses untuk melihat detail karyawan');
        setTimeout(() => navigate('/employee'), 2000);
      } else {
        setError('Gagal memuat detail karyawan. Silakan coba lagi nanti.');
      }
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

  const handleEdit = () => {
    navigate(`/employee/update/${id}`);
  };

  const handleEditPassword = () => {
    navigate(`/employee/update-password/${id}`);
  };

  const handleBack = () => {
    navigate('/employee');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (loading) {
    return (
      <div className="employee-form-container">
        <Navbar />
        <div className="employee-form-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h3 className="loading-text">Memuat detail karyawan...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-form-container">
        <Navbar />
        <div className="employee-form-content">
          <div className="error-container">
            <div className="error-text">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-form-container">
      <Navbar />
      <div className="employee-form-content">
        <h1 className="employee-detail-title">{employeeData.name}</h1>
        <div className="employee-detail-actions">
          <button className="back-btn" onClick={handleBack}>Kembali</button>
          <button className="update-btn" onClick={handleEdit}>Update Karyawan</button>
          <button className="primary-btn" onClick={handleEditPassword}>Update Password</button>
        </div>

        <div className="employee-detail-card">
          <div className="employee-detail-section">
            <div className="employee-detail-section-header">
              <span className="employee-detail-section-accent" />
              <span className="employee-detail-section-title">Informasi Umum</span>
            </div>
            <div className="employee-detail-section-content">
              <div className="employee-detail-row">
                <span className="employee-detail-label">Nama Karyawan:</span>
                <span className="employee-detail-value">{employeeData.name}</span>
              </div>
              <div className="employee-detail-row">
                <span className="employee-detail-label">Email:</span>
                <span className="employee-detail-value">{employeeData.email}</span>
              </div>
              <div className="employee-detail-row">
                <span className="employee-detail-label">Jenis Kelamin:</span>
                <span className="employee-detail-value">{employeeData.gender ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
              <div className="employee-detail-row">
                <span className="employee-detail-label">Tanggal Masuk:</span>
                <span className="employee-detail-value">{formatDate(employeeData.entryDate)}</span>
              </div>
              <div className="employee-detail-row">
                <span className="employee-detail-label">Nomor KTP:</span>
                <span className="employee-detail-value">{employeeData.ktpNumber || '-'}</span>
              </div>
              <div className="employee-detail-row">
                <span className="employee-detail-label">Tanggal Lahir:</span>
                <span className="employee-detail-value">{formatDate(employeeData.birthDate)}</span>
              </div>
              <div className="employee-detail-row">
                <span className="employee-detail-label">Role:</span>
                <span className="employee-detail-value">{employeeData.role || '-'}</span>
              </div>
            </div>
          </div>

          <div className="employee-detail-section">
            <div className="employee-detail-section-header">
              <span className="employee-detail-section-accent" />
              <span className="employee-detail-section-title">Kontak</span>
            </div>
            <div className="employee-detail-section-content">
              <div className="employee-detail-row">
                <span className="employee-detail-label">No. Telepon:</span>
                <span className="employee-detail-value">{employeeData.phone || '-'}</span>
              </div>
              <div className="employee-detail-row">
                <span className="employee-detail-label">No. Telepon Rumah:</span>
                <span className="employee-detail-value">{employeeData.homePhone || '-'}</span>
              </div>
              <div className="employee-detail-row">
                <span className="employee-detail-label">No. Telepon Bisnis:</span>
                <span className="employee-detail-value">{employeeData.businessPhone || '-'}</span>
              </div>
              <div className="employee-detail-row">
                <span className="employee-detail-label">No. WhatsApp:</span>
                <span className="employee-detail-value">{employeeData.whatsappNumber || '-'}</span>
              </div>
            </div>
          </div>

          <div className="employee-detail-section">
            <div className="employee-detail-section-header">
              <span className="employee-detail-section-accent" />
              <span className="employee-detail-section-title">Status</span>
            </div>
            <div className="employee-detail-section-content">
              <div className="employee-detail-row">
                <span className="employee-detail-label">Status Karyawan:</span>
                <span className="employee-detail-value">{employeeData.employeeStatus ? 'Aktif' : 'Tidak Aktif'}</span>
              </div>
              <div className="employee-detail-row">
                <span className="employee-detail-label">Catatan:</span>
                <span className="employee-detail-value">{employeeData.notes || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail; 