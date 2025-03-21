import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Pengeluaran.css";

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
            const formattedTanggal = `${formData.tanggal}T12:00:00`;

            const payload = {
                jenisPenerimaan: formData.jenisPenerimaan,
                jumlah: parseInt(formData.jumlah),
                tanggal: formattedTanggal,
                sumberPenerimaan: formData.sumberPenerimaan,
                keterangan: formData.keterangan,
            };

            const response = await axios.post("http://localhost:8080/api/penerimaan/create", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200 || response.status === 201) {
                alert("Penerimaan berhasil ditambahkan!");
                navigate("/revenue"); // arahkan ke halaman daftar penerimaan
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
        if (window.confirm("Apakah Anda yakin ingin membatalkan penambahan penerimaan?")) {
            navigate("/income");
        }
    };

    return (
        <div className="main-content">
            <div className="expense-container">
                <h2>Tambah Penerimaan</h2>
                <p className="subtitle">
                    Tambahkan penerimaan yang masuk dari luar penjualan utama seperti donasi, hibah, dan lainnya.
                </p>

                {error && <p className="error">{error}</p>}

                <form onSubmit={handleFormSubmit} className="expense-form">
                    <div className="form-group">
                        <label>Jenis Penerimaan</label>
                        <select name="jenisPenerimaan" value={formData.jenisPenerimaan} onChange={handleChange} required>
                            <option value="">Pilih jenis penerimaan</option>
                            <option value="Donasi">Donasi</option>
                            <option value="Hibah">Hibah</option>
                            <option value="InvestasiA">InvestasiA</option>
                            <option value="Penjualan Aset">Penjualan Aset</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Jumlah Penerimaan (Rp)</label>
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
                        <label>Tanggal Penerimaan</label>
                        <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Sumber Penerimaan</label>
                        <input
                            type="text"
                            name="sumberPenerimaan"
                            placeholder="Nama sumber penerimaan"
                            value={formData.sumberPenerimaan}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Keterangan</label>
                        <textarea
                            name="keterangan"
                            placeholder="Keterangan detail tentang penerimaan"
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
                            {isSubmitting ? "Menyimpan..." : "Simpan Penerimaan"}
                        </button>
                    </div>
                </form>

                {/* Confirmation Dialog with Details */}
                {showConfirmation && (
                    <div className="confirmation-overlay">
                        <div className="confirmation-dialog">
                            <h3>Konfirmasi Penerimaan</h3>
                            <p>Apakah Anda yakin ingin menambahkan penerimaan ini?</p>

                            <div className="confirmation-details">
                                <div className="detail-row">
                                    <span className="detail-label">Jenis:</span>
                                    <span className="detail-value">{formData.jenisPenerimaan}</span>
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
                                    <span className="detail-label">Sumber:</span>
                                    <span className="detail-value">{formData.sumberPenerimaan}</span>
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

export default Penerimaan;
