import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from '../Navbar';
import axiosInstance from '../../services/axiosInstance';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/GudangForm.css';

const UpdateGudang = () => {
    const { namaGudang } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationType, setConfirmationType] = useState('save');
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

    const fetchGudangData = useCallback(async (token) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/gudang/${namaGudang}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (response.data && response.data.data) {
                const gudangData = response.data.data;
    
                setFormData({
                    nama: gudangData.nama || '',
                    deskripsi: gudangData.deskripsi || '',
                    kapasitas: gudangData.kapasitas || '',
                    kepalaGudangId: gudangData.kepalaGudang?.id || '',
                    alamatGudang: {
                        alamat: gudangData.alamatGudang?.alamat || '',
                        kota: gudangData.alamatGudang?.kota || '',
                        provinsi: gudangData.alamatGudang?.provinsi || '',
                        kodePos: gudangData.alamatGudang?.kodePos || ''
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching gudang data:', error);
            toast.error('Gagal memuat data gudang');
            setTimeout(() => navigate('/gudang'), 2000);
        } finally {
            setLoading(false);
        }
    }, [namaGudang, navigate]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }
    
        fetchGudangData(token);
        fetchKepalaGudangList(token);
    }, [navigate, namaGudang, fetchGudangData]);

    const fetchKepalaGudangList = async (token) => {
        try {
            const response = await axiosInstance.get('/api/user/all?role=kepala_gudang', {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (response.data && response.data.data) {
                setKepalaGudangList(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching kepala gudang list:', error);
            toast.error('Gagal memuat daftar kepala gudang');
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
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.kapasitas) newErrors.kapasitas = "Kapasitas gudang harus diisi";
        if (formData.kapasitas && isNaN(formData.kapasitas)) newErrors.kapasitas = "Kapasitas harus berupa angka";
        if (!formData.alamatGudang.alamat.trim()) newErrors['alamatGudang.alamat'] = "Alamat harus diisi";
        if (!formData.alamatGudang.kota.trim()) newErrors['alamatGudang.kota'] = "Kota harus diisi";
        if (!formData.alamatGudang.provinsi.trim()) newErrors['alamatGudang.provinsi'] = "Provinsi harus diisi";
        if (!formData.alamatGudang.kodePos.trim()) newErrors['alamatGudang.kodePos'] = "Kode pos harus diisi";
        if (formData.alamatGudang.kodePos && !/^\d+$/.test(formData.alamatGudang.kodePos)) 
            newErrors['alamatGudang.kodePos'] = "Kode pos harus berupa angka";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setConfirmationType('save');
            setShowConfirmation(true);
        }
    };

    const confirmSubmit = async () => {
        setSaving(true);
        const token = localStorage.getItem("token");
        
        try {
            const response = await axiosInstance.put(
                `/api/gudang/update/${namaGudang}`,
                formData,
                {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    }
                }
            );
            
            if (response.status === 200) {
                toast.success('Gudang berhasil diperbarui!');
                setTimeout(() => navigate(`/gudang/${response.data.data.nama}`), 2000);
            }
        } catch (error) {
            console.error('Error updating gudang:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(`Gagal memperbarui gudang: ${error.response.data.message}`);
            } else {
                toast.error('Gagal memperbarui gudang. Silakan coba lagi.');
            }
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
            <div className="gudang-form-container">
                <Navbar />
                <div className="gudang-form-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <h3 className="loading-text">Memuat data gudang...</h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="gudang-form-container">
            <Navbar />
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="gudang-form-content">
                <div className="page-header">
                    <h1 className="page-title">Update Gudang</h1>
                </div>
                
                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-section">
                            <h3>Informasi Umum</h3>
                            
                            <div className="form-group">
                                <label htmlFor="nama">Nama Gudang</label>
                                <input
                                    type="text"
                                    id="nama"
                                    name="nama"
                                    value={formData.nama}
                                    readOnly
                                    className="read-only-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="deskripsi">Deskripsi</label>
                                <textarea
                                    id="deskripsi"
                                    name="deskripsi"
                                    value={formData.deskripsi}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Deskripsi singkat tentang gudang ini"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="kapasitas">Kapasitas<span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="kapasitas"
                                    name="kapasitas"
                                    value={formData.kapasitas}
                                    onChange={handleChange}
                                    className={errors.kapasitas ? "error-input" : ""}
                                    placeholder="Contoh: 500"
                                />
                                {errors.kapasitas && <span className="error-message">{errors.kapasitas}</span>}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="kepalaGudangId">Kepala Gudang <span className="required">*</span></label>
                                <select
                                    id="kepalaGudangId"
                                    name="kepalaGudangId"
                                    value={formData.kepalaGudangId}
                                    onChange={handleChange}
                                >
                                    <option value="">Pilih Kepala Gudang</option>
                                    {kepalaGudangList.map(kg => (
                                        <option key={kg.id} value={kg.id}>{kg.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="form-section">
                            <h3>Lokasi</h3>
                            
                            <div className="form-group">
                                <label htmlFor="alamat">Alamat<span className="required">*</span></label>
                                <textarea
                                    id="alamat"
                                    name="alamatGudang.alamat"
                                    value={formData.alamatGudang.alamat}
                                    onChange={handleChange}
                                    rows="3"
                                    className={errors['alamatGudang.alamat'] ? "error-input" : ""}
                                    placeholder="Masukkan alamat lengkap gudang"
                                />
                                {errors['alamatGudang.alamat'] && <span className="error-message">{errors['alamatGudang.alamat']}</span>}
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="kota">Kota<span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="kota"
                                        name="alamatGudang.kota"
                                        value={formData.alamatGudang.kota}
                                        onChange={handleChange}
                                        className={errors['alamatGudang.kota'] ? "error-input" : ""}
                                        placeholder="Nama kota"
                                    />
                                    {errors['alamatGudang.kota'] && <span className="error-message">{errors['alamatGudang.kota']}</span>}
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="provinsi">Provinsi<span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="provinsi"
                                        name="alamatGudang.provinsi"
                                        value={formData.alamatGudang.provinsi}
                                        onChange={handleChange}
                                        className={errors['alamatGudang.provinsi'] ? "error-input" : ""}
                                        placeholder="Nama provinsi"
                                    />
                                    {errors['alamatGudang.provinsi'] && <span className="error-message">{errors['alamatGudang.provinsi']}</span>}
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="kodePos">Kode Pos<span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="kodePos"
                                    name="alamatGudang.kodePos"
                                    value={formData.alamatGudang.kodePos}
                                    onChange={handleChange}
                                    className={errors['alamatGudang.kodePos'] ? "error-input" : ""}
                                    placeholder="Contoh: 12345"
                                />
                                {errors['alamatGudang.kodePos'] && <span className="error-message">{errors['alamatGudang.kodePos']}</span>}
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={handleCancel}>
                                Batal
                            </button>
                            <button type="submit" className="submit-btn" disabled={saving}>
                                {saving ? <><i className="fa fa-spinner fa-spin"></i> Menyimpan...</> : <>Simpan Perubahan</>}
                            </button>
                        </div>
                    </form>
                </div>
                
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
                                            <i className="fa fa-spinner fa-spin"></i>
                                            <p>Sedang menyimpan perubahan data gudang...</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="modal-header">
                                        <h3>{confirmationType === 'save' ? 'Konfirmasi Perubahan' : 'Konfirmasi Batal'}</h3>
                                        <button 
                                            className="close-button"
                                            onClick={() => setShowConfirmation(false)}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        {confirmationType === 'save' ? (
                                            <p>Apakah Anda yakin ingin menyimpan perubahan pada gudang "{formData.nama}"?</p>
                                        ) : (
                                            <>
                                                <p>Apakah Anda yakin ingin membatalkan perubahan?</p>
                                                <p className="warning-text">Semua perubahan yang telah dilakukan akan hilang.</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="modal-footer">
                                        <button 
                                            className="secondary-btn" 
                                            onClick={() => setShowConfirmation(false)}
                                        >
                                            Kembali
                                        </button>
                                        <button 
                                            className={confirmationType === 'save' ? "primary-btn" : "danger-btn"}
                                            onClick={confirmationType === 'save' ? confirmSubmit : () => navigate(`/gudang/${namaGudang}`)}
                                        >
                                            {confirmationType === 'save' ? "Ya, Perbarui" : "Ya, Batalkan"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpdateGudang;