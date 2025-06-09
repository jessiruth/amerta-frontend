import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from '../../services/axiosInstance';
import '../../styles/GudangForm.css';

const AddGudang = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [kepalaGudangList, setKepalaGudangList] = useState([]);
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    kapasitas: '',
    kepalaGudangId: '',
    alamatGudang: {
      alamat: '',
      kota: '',
      provinsi: '',
      kodePos: ''
    }
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Sesi telah berakhir. Silakan login kembali.");
      navigate("/");
      return;
    }
    fetchKepalaGudangList(token);
  }, [navigate]);

  const fetchKepalaGudangList = async (token) => {
    try {
      const response = await axiosInstance.get('/api/user/all?role=kepala_gudang', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.data) {
        setKepalaGudangList(response.data.data);
      }
    } catch {
      toast.error("Gagal memuat daftar kepala gudang");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nama.trim()) newErrors.nama = "Nama gudang harus diisi";
    if (!formData.kapasitas) newErrors.kapasitas = "Kapasitas gudang harus diisi";
    if (formData.kapasitas && isNaN(formData.kapasitas)) newErrors.kapasitas = "Kapasitas harus berupa angka";
    if (formData.kapasitas && Number(formData.kapasitas) <= 0) newErrors.kapasitas = "Kapasitas harus lebih dari 0";
    if (!formData.kepalaGudangId) newErrors.kepalaGudangId = "Kepala gudang harus dipilih";
    if (!formData.alamatGudang.alamat.trim()) newErrors['alamatGudang.alamat'] = "Alamat harus diisi";
    if (!formData.alamatGudang.kota.trim()) newErrors['alamatGudang.kota'] = "Kota harus diisi";
    if (!formData.alamatGudang.provinsi.trim()) newErrors['alamatGudang.provinsi'] = "Provinsi harus diisi";
    if (!formData.alamatGudang.kodePos.trim()) newErrors['alamatGudang.kodePos'] = "Kode pos harus diisi";
    if (formData.alamatGudang.kodePos && !/^\d+$/.test(formData.alamatGudang.kodePos)) {
        newErrors['alamatGudang.kodePos'] = "Kode pos harus berupa angka";
    }
    if (formData.alamatGudang.kodePos && formData.alamatGudang.kodePos.length > 5) {
        newErrors['alamatGudang.kodePos'] = "Kode pos maksimal 5 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmation(true);
    } else {
      const firstError = document.querySelector('.error-message');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.error('Mohon perbaiki kesalahan pada formulir');
    }
  };

  const confirmSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axiosInstance.post('/api/gudang/add', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 201) {
        setShowConfirmation(false); // tutup konfirmasi
        setShowSuccessModal(true);  // tampilkan modal sukses
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan gudang.');
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(true);
  };

  return (
    <div className="gudang-form-container">
      <div className="gudang-form-content">
        <div className="page-header">
          <h1 className="page-title">Tambah Gudang Baru</h1>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Informasi Umum</h3>

              <div className="form-group">
                <label htmlFor="nama">Nama Gudang<span className="required">*</span></label>
                <input type="text" id="nama" name="nama" value={formData.nama}
                  onChange={handleChange} className={errors.nama ? "error-input" : ""} placeholder="Masukkan nama gudang" />
                {errors.nama && <span className="error-message">{errors.nama}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="deskripsi">Deskripsi</label>
                <textarea id="deskripsi" name="deskripsi" value={formData.deskripsi}
                  onChange={handleChange} className={errors.deskripsi ? "error-input" : ""} rows="4" placeholder="Deskripsi singkat tentang gudang ini" />
              </div>

              <div className="form-group">
                <label htmlFor="kapasitas">Kapasitas<span className="required">*</span></label>
                <input type="text" id="kapasitas" name="kapasitas" value={formData.kapasitas}
                  onChange={handleChange} className={errors.kapasitas ? "error-input" : ""} placeholder="Contoh: 500" />
                {errors.kapasitas && <span className="error-message">{errors.kapasitas}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="kepalaGudangId">Kepala Gudang <span className="required">*</span></label>
                <select id="kepalaGudangId" name="kepalaGudangId" value={formData.kepalaGudangId}
                  onChange={handleChange} className={errors.kepalaGudangId ? "error-input" : ""}>
                  <option value="">Pilih Kepala Gudang</option>
                  {kepalaGudangList.map(kg => (
                    <option key={kg.id} value={kg.id}>{kg.name}</option>
                  ))}
                </select>
                {errors.kepalaGudangId && <span className="error-message">{errors.kepalaGudangId}</span>}
              </div>
            </div>

            <div className="form-section">
              <h3>Lokasi</h3>

              <div className="form-group">
                <label htmlFor="alamat">Alamat<span className="required">*</span></label>
                <textarea id="alamat" name="alamatGudang.alamat" value={formData.alamatGudang.alamat}
                  onChange={handleChange} rows="3" className={errors['alamatGudang.alamat'] ? "error-input" : ""} placeholder="Masukkan alamat lengkap gudang" />
                {errors['alamatGudang.alamat'] && <span className="error-message">{errors['alamatGudang.alamat']}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="kota">Kota<span className="required">*</span></label>
                  <input type="text" id="kota" name="alamatGudang.kota" value={formData.alamatGudang.kota}
                    onChange={handleChange} className={errors['alamatGudang.kota'] ? "error-input" : ""} placeholder="Nama kota" />
                  {errors['alamatGudang.kota'] && <span className="error-message">{errors['alamatGudang.kota']}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="provinsi">Provinsi<span className="required">*</span></label>
                  <input type="text" id="provinsi" name="alamatGudang.provinsi" value={formData.alamatGudang.provinsi}
                    onChange={handleChange} className={errors['alamatGudang.provinsi'] ? "error-input" : ""} placeholder="Nama provinsi" />
                  {errors['alamatGudang.provinsi'] && <span className="error-message">{errors['alamatGudang.provinsi']}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="kodePos">Kode Pos<span className="required">*</span></label>
                <input type="text" id="kodePos" name="alamatGudang.kodePos" value={formData.alamatGudang.kodePos}
                  onChange={handleChange} className={errors['alamatGudang.kodePos'] ? "error-input" : ""} placeholder="Contoh: 12345" />
                {errors['alamatGudang.kodePos'] && <span className="error-message">{errors['alamatGudang.kodePos']}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCancel}>Batal</button>
              <button type="submit" className="submit-btn" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </div>

        {showConfirmation && (
            <div className="modal-overlay">
                <div className="modal-content">
                    {loading ? (
                        <>
                            <div className="modal-header">
                                <h3>Menyimpan Data</h3>
                            </div>
                            <div className="modal-body">
                                <div className="loading-indicator">
                                    <div className="loading-spinner"></div>
                                    <p>Sedang menyimpan data gudang...</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="modal-header">
                                <h3>{formData.nama ? formData.nama : 'Konfirmasi'}</h3>
                                <button 
                                    className="close-button"
                                    onClick={() => setShowConfirmation(false)}
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Apakah Anda yakin ingin {formData.nama ? `menambahkan gudang "${formData.nama}"` : 'membatalkan penambahan gudang'}?</p>
                                
                                {!formData.nama && <p className="warning-text">Semua data yang telah dimasukkan akan hilang.</p>}
                            </div>
                            <div className="modal-footer">
                                <button 
                                    className="secondary-btn" 
                                    onClick={() => setShowConfirmation(false)}
                                >
                                    Kembali
                                </button>
                                <button 
                                    className={formData.nama ? "primary-btn" : "danger-btn"}
                                    onClick={formData.nama ? confirmSubmit : () => navigate('/gudang')}
                                >
                                    {formData.nama ? "Ya, Tambahkan" : "Ya, Batalkan"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

        {/* Modal Sukses */}
        {showSuccessModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                <div className="modal-header">
                    <h3>Gudang Ditambahkan</h3>
                    <button className="close-button" onClick={() => setShowSuccessModal(false)}>&times;</button>
                </div>
                <div className="modal-body">
                    <p>Gudang berhasil ditambahkan. Anda akan diarahkan ke detail gudang.</p>
                </div>
                <div className="modal-footer">
                    <button
                    className="primary-btn"
                    onClick={() => navigate(`/gudang/${encodeURIComponent(formData.nama)}`)}
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

export default AddGudang;