import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import "../styles/AddGoodsTransport.css";

const AddGoodsTransport = () => {
    const [gudangList, setGudangList] = useState([]);
    const [barangList, setBarangList] = useState([]);
    const [selectedGudangAsal, setSelectedGudangAsal] = useState("");
    const [selectedGudangTujuan, setSelectedGudangTujuan] = useState("");
    const [barangTransfer, setBarangTransfer] = useState([]);
    const [tanggalPemindahan, setTanggalPemindahan] = useState(new Date().toISOString().split("T")[0]);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchGudang = async () => {
            try {
                const response = await axiosInstance.get("/api/gudang/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGudangList(response.data.data);
            } catch (err) {
                console.error("Error fetching gudang:", err);
                setError("Gagal mengambil data gudang.");
            }
        };

        const fetchBarang = async () => {
            try {
                const response = await axiosInstance.get("/api/barang/viewall", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBarangList(response.data.data);
            } catch (err) {
                console.error("Error fetching barang:", err);
                setError("Gagal mengambil data barang.");
            }
        };

        fetchGudang();
        fetchBarang();
    }, [token]);

    const handleAddBarang = () => {
        setBarangTransfer([...barangTransfer, { id: "", jumlah: "" }]);
    };

    const handleRemoveBarang = (index) => {
        const newBarangTransfer = [...barangTransfer];
        newBarangTransfer.splice(index, 1);
        setBarangTransfer(newBarangTransfer);
    };

    const handleBarangChange = (index, field, value) => {
        const newBarangTransfer = [...barangTransfer];
        newBarangTransfer[index][field] = value;
        setBarangTransfer(newBarangTransfer);
    };

    const validateForm = () => {
        if (!selectedGudangAsal || !selectedGudangTujuan) {
            setError("Gudang asal dan tujuan harus dipilih.");
            return false;
        }
        if (selectedGudangAsal === selectedGudangTujuan) {
            setError("Gudang asal dan tujuan tidak boleh sama.");
            return false;
        }
        if (barangTransfer.length === 0) {
            setError("Minimal satu barang harus ditambahkan.");
            return false;
        }
        for (let barang of barangTransfer) {
            if (!barang.id || !barang.jumlah || barang.jumlah <= 0) {
                setError("Barang harus dipilih dan jumlah harus lebih dari 0.");
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const confirm = window.confirm("Apakah Anda yakin ingin menyimpan pemindahan barang ini?");
        if (!confirm) return;
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                tanggalPemindahan,
                gudangAsal: selectedGudangAsal,
                gudangTujuan: selectedGudangTujuan,
                listBarang: barangTransfer,
            };

            const response = await axiosInstance.post("/api/barang/transfer", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if ([200, 201].includes(response.status)) {
                alert("Pemindahan barang berhasil!");
                navigate("/goods-transport");
            } else {
                setError("Gagal melakukan pemindahan barang. Silakan coba lagi.");
            }
        } catch (err) {
            console.error("Error submitting transfer:", err);
            setError("Terjadi kesalahan saat mengirim data.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="gudang-form-container">
            <div className="gudang-form-content">
                <div className="page-header">
                    <h1 className="page-title">Tambah Pemindahan Barang</h1>
                </div>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit} className="form-container">
                    <div className="form-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Tanggal Pemindahan</label>
                                <input type="date" value={tanggalPemindahan} onChange={(e) => setTanggalPemindahan(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Gudang Asal</label>
                                <select value={selectedGudangAsal} onChange={(e) => setSelectedGudangAsal(e.target.value)} required>
                                    <option value="">Pilih Gudang Asal</option>
                                    {gudangList.map((g) => <option key={g.nama} value={g.nama}>{g.nama}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Gudang Tujuan</label>
                                <select value={selectedGudangTujuan} onChange={(e) => setSelectedGudangTujuan(e.target.value)} required>
                                    <option value="">Pilih Gudang Tujuan</option>
                                    {gudangList.map((g) => <option key={g.nama} value={g.nama}>{g.nama}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Barang yang Dipindahkan (Pilih Gudang Asal Terlebih Dahulu)</label>
                            {barangTransfer.map((item, index) => (
                                <div key={index} className="barang-item">
                                    <select value={item.id} onChange={(e) => handleBarangChange(index, "id", e.target.value)} required>
                                        <option value="">Pilih Barang</option>
                                        {barangList
                                            .filter(barang => barang.stockBarang.some(stock => stock.namaGudang === selectedGudangAsal))
                                            .map(barang => {
                                                const stockInfo = barang.stockBarang.find(s => s.namaGudang === selectedGudangAsal);
                                                return (
                                                    <option key={barang.id} value={barang.id}>
                                                        {barang.nama} (Stok: {stockInfo?.stock || 0})
                                                    </option>
                                                );
                                            })}
                                    </select>
                                    <input type="number" placeholder="Jumlah" value={item.jumlah} onChange={(e) => handleBarangChange(index, "jumlah", e.target.value)} required />
                                    <button type="button" className="danger-btn" onClick={() => handleRemoveBarang(index)}>Hapus</button>
                                </div>
                            ))}
                            <button type="button" className="primary-btn" onClick={handleAddBarang}>Tambah Barang</button>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => {
                            if (window.confirm("Apakah Anda yakin ingin membatalkan transfer barang?")) navigate("/goods-transport");
                        }}>Batal</button>
                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddGoodsTransport;
