import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submission (mirip Login.js)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
    
        try {
            console.log("Mengirim permintaan tambah pengeluaran...");
    
            // Ubah tanggal menjadi LocalDateTime format "YYYY-MM-DDTHH:MM:SS"
            const formattedTanggal = `${formData.tanggal}T00:00:00`;
    
            const payload = {
                ...formData,
                tanggal: formattedTanggal, // Pastikan formatnya benar
            };
    
            console.log("Payload yang dikirim:", payload);
    
            const response = await axios.post("http://localhost:8080/api/pengeluaran/create", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            console.log("Response dari server:", response);
    
            if (response.status === 200 || response.status === 201) {
                console.log("Pengeluaran berhasil ditambahkan!");
                alert("Pengeluaran berhasil ditambahkan!");
                navigate("/home"); // Redirect setelah sukses
            } else {
                console.log("Gagal menambahkan pengeluaran:", response.data);
                setError("Gagal menambahkan pengeluaran. Silakan coba lagi.");
            }
        } catch (err) {
            console.error("Terjadi kesalahan:", err);
    
            if (err.response) {
                console.log("Response error:", err.response);
                setError(err.response.data.message || "Terjadi kesalahan saat menambahkan pengeluaran.");
            } else if (err.request) {
                console.log("Request error:", err.request);
                setError("Tidak ada respons dari server. Periksa koneksi Anda.");
            } else {
                console.log("Error lainnya:", err.message);
                setError("Terjadi kesalahan yang tidak diketahui.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle cancel with confirmation
    const handleCancel = () => {
      if (window.confirm("Apakah Anda yakin ingin membatalkan penambahan pengeluaran?")) {
          console.log("Membatalkan penambahan pengeluaran");
  
          setFormData({
              jenisPengeluaran: "",
              jumlah: "",
              tanggal: new Date().toISOString().split("T")[0],
              penanggung_jawab: "",
              keterangan: "",
          });
  
          setError("");
          console.log("Form telah direset ke kondisi awal");
          navigate("/create-pengeluaran");
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

                <form onSubmit={handleSubmit} className="expense-form">
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
            </div>
        </div>
    );
};

export default Pengeluaran;
