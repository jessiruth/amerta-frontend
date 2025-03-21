import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import "../styles/Pengeluaran.css";

const Pengeluaran = () => {
    const [formData, setFormData] = useState({
        jenisPengeluaran: "",
        jumlah: "",
        tanggal: new Date().toISOString().split("T")[0],
        penanggung_jawab: "",
        keterangan: "",
    });

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setShowConfirmation(true);
    };

    const handleConfirmSubmit = async () => {
        setShowConfirmation(false);
        setError("");
        setIsSubmitting(true);

        try {
            const formattedTanggal = `${formData.tanggal}T00:00:00`;

            const payload = {
                ...formData,
                tanggal: formattedTanggal,
            };

            const response = await axiosInstance.post("http://localhost:8080/api/pengeluaran/create", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200 || response.status === 201) {
                alert("Pengeluaran berhasil ditambahkan!");
                navigate("/expense");
            } else {
                setError("Gagal menambahkan pengeluaran. Silakan coba lagi.");
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || "Terjadi kesalahan saat menambahkan pengeluaran.");
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
        if (window.confirm("Apakah Anda yakin ingin membatalkan penambahan pengeluaran?")) {
            navigate("/expense");
        }
    };

    return (
        <div className="main-content">
            <div className="expense-container">
                <h2>Tambah Pengeluaran</h2>
                <p className="subtitle">
                    Tambahkan pengeluaran yang terjadi di luar purchase order seperti gaji, tunjangan, dan lain-lain.
                </p>

                {error && <p className="error">{error}</p>}

                <form onSubmit={handleFormSubmit} className="expense-form">
                    <div className="form-group">
                        <label>Jenis Pengeluaran</label>
                        <select name="jenisPengeluaran" value={formData.jenisPengeluaran} onChange={handleChange} required>
                            <option value="">Pilih jenis pengeluaran</option>
                            <option value="Gaji Karyawan">Gaji Karyawan</option>
                            <option value="Tunjangan">Tunjangan</option>
                            <option value="Utilitas">Utilitas</option>
                            <option value="Sewa">Sewa</option>
                            <option value="Pajak">Pajak</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Jumlah Pengeluaran (Rp)</label>
                        <input
                            type="number"
                            name="jumlah"
                            placeholder="0"
                            value={formData.jumlah}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Tanggal Pengeluaran</label>
                        <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Penanggung Jawab</label>
                        <input
                            type="text"
                            name="penanggung_jawab"
                            placeholder="Nama penanggung jawab"
                            value={formData.penanggung_jawab}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Keterangan</label>
                        <textarea
                            name="keterangan"
                            placeholder="Keterangan detail tentang pengeluaran"
                            value={formData.keterangan}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-button" onClick={handleCancel}>
                            Batal
                        </button>
                        <button type="submit" className="submit-button" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Simpan Pengeluaran"}
                        </button>
                    </div>
                </form>

                {/* Confirmation Dialog with Details */}
                {showConfirmation && (
                    <div className="confirmation-overlay">
                        <div className="confirmation-dialog">
                            <h3>Konfirmasi Pengeluaran</h3>
                            <p>Apakah Anda yakin ingin menambahkan pengeluaran ini?</p>

                            <div className="confirmation-details">
                                <div className="detail-row">
                                    <span className="detail-label">Jenis:</span>
                                    <span className="detail-value">{formData.jenisPengeluaran}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Jumlah:</span>
                                    <span className="detail-value">Rp {Number(formData.jumlah).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Tanggal:</span>
                                    <span className="detail-value">{formData.tanggal}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Penanggung Jawab:</span>
                                    <span className="detail-value">{formData.penanggung_jawab}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Keterangan:</span>
                                    <span className="detail-value">{formData.keterangan}</span>
                                </div>
                            </div>

                            <div className="confirmation-actions">
                                <button className="cancel-button" onClick={() => setShowConfirmation(false)}>
                                    Batal
                                </button>
                                <button className="confirm-button" onClick={handleConfirmSubmit}>
                                    Ya, Tambahkan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pengeluaran;
