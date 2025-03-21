import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
                const response = await axios.get("http://localhost:8080/api/gudang/", {
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
                const response = await axios.get("http://localhost:8080/api/barang/viewall", {
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

            const response = await axios.post("http://localhost:8080/api/barang/transfer", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200 || response.status === 201) {
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
        <div className="add-goods-transport-container">
            <div className="form-box">
                <h1 className="page-title">Add Goods Transport</h1>

                {error && <p className="error">{error}</p>}

                <form onSubmit={handleSubmit} className="add-goods-transport-form">
                    {/* Tanggal Pemindahan */}
                    <div className="form-group">
                        <label><b>Tanggal Pemindahan</b></label>
                        <input type="date" value={tanggalPemindahan} onChange={(e) => setTanggalPemindahan(e.target.value)} required />
                    </div>

                    {/* Gudang Asal */}
                    <div className="form-group">
                        <label><b>Gudang Asal</b></label>
                        <select value={selectedGudangAsal} onChange={(e) => setSelectedGudangAsal(e.target.value)} required>
                            <option value="">Pilih Gudang Asal</option>
                            {gudangList.map((gudang) => (
                                <option key={gudang.nama} value={gudang.nama}>{gudang.nama}</option>
                            ))}
                        </select>
                    </div>

                    {/* Gudang Tujuan */}
                    <div className="form-group">
                        <label><b>Gudang Tujuan</b></label>
                        <select value={selectedGudangTujuan} onChange={(e) => setSelectedGudangTujuan(e.target.value)} required>
                            <option value="">Pilih Gudang Tujuan</option>
                            {gudangList.map((gudang) => (
                                <option key={gudang.nama} value={gudang.nama}>{gudang.nama}</option>
                            ))}
                        </select>
                    </div>

                    {/* Barang List */}
                    <div className="barang-list">
                        <label><b>Barang yang Dipindahkan (Pilih Gudang Asal Terlebih Dahulu)</b></label>
                        {barangTransfer.map((item, index) => (
                            <div key={index} className="barang-item">
                                <select value={item.id} onChange={(e) => handleBarangChange(index, "id", e.target.value)} required>
                                    <option value="">Pilih Barang</option>
                                    {barangList
                                        .filter((barang) =>
                                            barang.stockBarang.some((stock) => stock.namaGudang === selectedGudangAsal)
                                        )
                                        .map((barang) => {
                                            const stockInfo = barang.stockBarang.find((s) => s.namaGudang === selectedGudangAsal);
                                            return (
                                                <option key={barang.id} value={barang.id}>
                                                    {barang.nama} (Stok: {stockInfo?.stock || 0})
                                                </option>
                                            );
                                        })}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Jumlah"
                                    value={item.jumlah}
                                    onChange={(e) => handleBarangChange(index, "jumlah", e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => handleRemoveBarang(index)}>Hapus</button>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddBarang}>Tambah Barang</button>
                    </div>

                    {/* Submit & Cancel Buttons */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => {
                                if (window.confirm("Apakah Anda yakin ingin membatalkan transfer barang?")) {
                                    navigate("/goods-transport");
                                }
                            }}
                        >
                            Batal
                        </button>
                        <button type="submit" className="submit-button" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddGoodsTransport;
