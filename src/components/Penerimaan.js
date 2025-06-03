import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import "../styles/AddGoodsAndServices.css";

const Penerimaan = () => {
  const [formData, setFormData] = useState({
    jenisPenerimaan: "",
    jumlah: "",
    tanggal: new Date().toISOString().split("T")[0],
    sumberPenerimaan: "",
    keterangan: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
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
    ["jumlah", "tanggal", "sumberPenerimaan", "keterangan"].forEach((field) => {
      if (!formData[field].trim()) {
        errors[field] = `${field.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())} wajib diisi.`;
      }
    });
    if (!formData.jenisPenerimaan.trim()) {
        errors.jenisPenerimaan = "Jenis Penerimaan wajib diisi.";
    }
    if (formData.jumlah) {
      if (isNaN(formData.jumlah)) {
        errors.jumlah = "Jumlah harus berupa angka.";
      } else if (!/^\d+$/.test(formData.jumlah)) {
        errors.jumlah = "Jumlah tidak boleh mengandung desimal.";
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    if (!validateForm()) {
      const firstError = document.querySelector(".barang-error");
      if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmation(false);
    setError("");
    setIsSubmitting(true);

    try {
      const formattedTanggal = `${formData.tanggal}T12:00:00`;

      const payload = {
        jenisPenerimaan: formData.jenisPenerimaan,
        jumlah: parseInt(formData.jumlah),
        tanggal: formattedTanggal,
        sumberPenerimaan: formData.sumberPenerimaan,
        keterangan: formData.keterangan,
      };

      const response = await axiosInstance.post("/api/penerimaan/create", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setShowSuccessModal(true);
      } else {
        setError("Gagal menambahkan penerimaan. Silakan coba lagi.");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Terjadi kesalahan saat menambahkan penerimaan.");
      } else if (err.request) {
        setError("Tidak ada respons dari server. Periksa koneksi Anda.");
      } else {
        setError("Terjadi kesalahan yang tidak diketahui.");
      }
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
        <h1 className="barang-page-title">Tambah Penerimaan</h1>
      </div>
      <div className="barang-form-content">
        {error && <p className="barang-error">{error}</p>}

        <form onSubmit={handleFormSubmit}>
          <div className="barang-form-section">
            <div className="barang-form-group">
              <label>Jenis Penerimaan<span className="required">*</span></label>
              <select name="jenisPenerimaan" value={formData.jenisPenerimaan} onChange={handleChange}>
                <option value="">Pilih jenis penerimaan</option>
                <option value="Donasi">Donasi</option>
                <option value="Hibah">Hibah</option>
                <option value="Investasi">Investasi</option>
                <option value="Penjualan Aset">Penjualan Aset</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              {hasSubmitted && validationErrors.jenisPenerimaan && <div className="barang-error">{validationErrors.jenisPenerimaan}</div>}
            </div>

            <div className="barang-form-group">
              <label>Jumlah Penerimaan (Rp)<span className="required">*</span></label>
              <input
                type="text"
                name="jumlah"
                placeholder="0"
                value={formData.jumlah}
                onChange={handleChange}
              />
              {hasSubmitted && validationErrors.jumlah && <div className="barang-error">{validationErrors.jumlah}</div>}
            </div>

            <div className="barang-form-group">
              <label>Tanggal Penerimaan<span className="required">*</span></label>
              <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} />
              {hasSubmitted && validationErrors.tanggal && <div className="barang-error">{validationErrors.tanggal}</div>}
            </div>

            <div className="barang-form-group">
              <label>Sumber Penerimaan<span className="required">*</span></label>
              <input
                type="text"
                name="sumberPenerimaan"
                placeholder="Nama sumber penerimaan"
                value={formData.sumberPenerimaan}
                onChange={handleChange}
              />
              {hasSubmitted && validationErrors.sumberPenerimaan && <div className="barang-error">{validationErrors.sumberPenerimaan}</div>}
            </div>

            <div className="barang-form-group">
              <label>Keterangan<span className="required">*</span></label>
              <textarea
                name="keterangan"
                placeholder="Keterangan detail tentang penerimaan"
                value={formData.keterangan}
                onChange={handleChange}
              />
              {hasSubmitted && validationErrors.keterangan && <div className="barang-error">{validationErrors.keterangan}</div>}
            </div>
          </div>

          <div className="barang-actions">
            <button type="button" className="barang-cancel-btn" onClick={handleCancel}>Batal</button>
            <button type="submit" className="barang-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Penerimaan"}
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
              <p>Apakah Anda yakin ingin menyimpan penerimaan ini?</p>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowConfirmation(false)}>Kembali</button>
              <button className="primary-btn" onClick={handleConfirmSubmit}>Ya, Simpan</button>
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
              <p>Apakah Anda yakin ingin membatalkan penambahan penerimaan?</p>
              <p className="warning-text">Semua data yang telah dimasukkan akan hilang.</p>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowCancelConfirmation(false)}>Kembali</button>
              <button className="danger-btn" onClick={() => navigate("/revenue")}>Ya, Batalkan</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Penerimaan Ditambahkan</h3>
              <button className="close-button" onClick={() => setShowSuccessModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Penerimaan berhasil ditambahkan. Anda akan diarahkan ke halaman penerimaan.</p>
            </div>
            <div className="modal-footer">
              <button className="primary-btn" onClick={() => navigate("/revenue")}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Penerimaan;