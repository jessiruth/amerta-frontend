import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/UpdateGoods.css";
import DeleteIcon from "@mui/icons-material/Delete";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const UpdateGoods = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [nama, setNama] = useState("");
    const [kategori, setKategori] = useState("");
    const [merk, setMerk] = useState("");
    const [isActive, setIsActive] = useState(null);
    const [stokList, setStokList] = useState([]);
    const [gudangOptions, setGudangOptions] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [hargaBeli, setHargaBeli] = useState(null);
    const [hargaJual, setHargaJual] = useState(null);

    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/login");
    }

    const fetchBarangDetail = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/api/barang/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            const barang = response.data.data;
            setNama(barang.nama);
            setKategori(barang.kategori);
            setMerk(barang.merk);
            setIsActive(barang.active);
            setHargaBeli(barang.hargaBeli);
            setHargaJual(barang.hargaJual);
            setStokList(barang.stockBarang.map(stock => ({
                stock: stock.stock,
                namaGudang: stock.namaGudang,
                isExisting: true
            })));
        } catch (error) {
            console.error("Error fetching barang data:", error);
            setErrorMessage("Gagal mengambil data barang.");
            setIsErrorModalOpen(true);
        }
    }, [id, token]);

    const fetchGudangOptions = useCallback(async () => {
        try {
            const response = await axiosInstance.get("/api/gudang/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGudangOptions(response.data.data.map(gudang => gudang.nama));
        } catch (error) {
            console.error("Error fetching gudang data:", error);
            setErrorMessage("Gagal mengambil daftar gudang.");
            setIsErrorModalOpen(true);
        }
    }, [token]);

    useEffect(() => {
        fetchBarangDetail();
        fetchGudangOptions();
    }, [fetchBarangDetail, fetchGudangOptions]);

    const addStockRow = () => {
        setStokList([...stokList, { stock: "", namaGudang: "", isExisting: false }]);
    };

    const removeStockRow = (index) => {
        setStokList(stokList.filter((_, i) => i !== index));
    };

    const updateStockRow = (index, field, value) => {
        const updatedStokList = [...stokList];
        updatedStokList[index][field] = value;
        setStokList(updatedStokList);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage("");

        if (!nama || !kategori || !merk || !hargaBeli || !hargaJual || stokList.length === 0) {
            setErrorMessage("Semua field harus diisi!");
            setIsErrorModalOpen(true);
            return;
        }

        for (let stok of stokList) {
            if (!stok.namaGudang) {
                setErrorMessage("Harap pilih gudang untuk setiap stok!");
                setIsErrorModalOpen(true);
                return;
            }
        }

        setIsConfirmModalOpen(true);
    };

    const confirmSubmit = async () => {
        setIsConfirmModalOpen(false);

        const requestData = {
            nama,
            kategori,
            active: isActive,
            merk,
            hargaBeli: parseFloat(hargaBeli),
            hargaJual: parseFloat(hargaJual),
            listStockBarang: stokList.map(({ stock, namaGudang }) => ({
                stock: parseInt(stock),
                namaGudang
            }))
        };

        try {
            await axiosInstance.put(`/api/barang/update/${id}`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error("Error updating barang:", error);
            setErrorMessage(error.response?.data?.message || "Terjadi kesalahan saat mengupdate barang.");
            setIsErrorModalOpen(true);
        }
    };

    return (
        <div className="update-goods-page-container">
            <div className="update-goods-form-container">
                <h1 className="update-goods-page-title">Update Goods & Service</h1>

                <form className="update-goods-form" onSubmit={handleSubmit}>
                    <label className="update-goods-label">Nama Barang:</label>
                    <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required />

                    <label className="update-goods-label">Kategori:</label>
                    <input type="text" value={kategori} onChange={(e) => setKategori(e.target.value)} required />

                    <label className="update-goods-label">Merk:</label>
                    <input type="text" value={merk} onChange={(e) => setMerk(e.target.value)} required />

                    <label className="update-goods-label">Harga Beli:</label>
                    <input type="number" step="0.01" min="1" placeholder="contoh: 12000,50" value={hargaBeli || ""} onChange={(e) => setHargaBeli(e.target.value)} required/>

                    <label className="update-goods-label">Harga Jual:</label>
                    <input type="number" step="0.01" min="1" placeholder="contoh: 15000,75" value={hargaJual || ""} onChange={(e) => setHargaJual(e.target.value)} required/>

                    <label className="update-goods-label">Status Barang:</label>
                    <div className="update-goods-radio-group">
                        <label>
                            <input type="radio" name="isActive" value="true" checked={isActive === true} onChange={(e) => setIsActive(e.target.value === "true")} />
                            Active
                        </label>
                        <label>
                            <input type="radio" name="isActive" value="false" checked={isActive === false} onChange={(e) => setIsActive(e.target.value === "true")} />
                            Inactive
                        </label>
                    </div>

                    <div className="update-goods-stock-section">
                        <h3>Stock Barang per Gudang:</h3>
                        <button type="button" onClick={addStockRow} className="update-goods-btn-stock-add">+ Add</button>
                    </div>

                    <div className="update-goods-scrollable-table">
                        <table className="update-goods-stock-table">
                            <thead>
                                <tr>
                                    <th>Stock</th>
                                    <th>Gudang</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stokList.map((stok, index) => (
                                    <tr key={index}>
                                        <td>
                                            <input type="number" min="0" value={stok.stock}
                                                onChange={(e) => updateStockRow(index, "stock", e.target.value)} required />
                                        </td>
                                        <td>
                                            {stok.isExisting ? (
                                                <span>{stok.namaGudang}</span>
                                            ) : (
                                                <select value={stok.namaGudang} onChange={(e) => updateStockRow(index, "namaGudang", e.target.value)} required>
                                                    <option value="" disabled hidden>Pilih Gudang...</option>
                                                    {gudangOptions.map((gudang, idx) => (
                                                        <option key={idx} value={gudang}>{gudang}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                        <td>
                                            {!stok.isExisting && (
                                                <button
                                                    type="button"
                                                    className="update-goods-btn-delete-stock"
                                                    onClick={() => removeStockRow(index)}
                                                    title="Hapus stok ini">
                                                    <DeleteIcon />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="update-goods-button-group">
                        <button type="button" className="update-goods-btn-cancel" onClick={() => navigate("/goods-and-services")}>Cancel</button>
                        <button type="submit" className="update-goods-btn-save">Update</button>
                    </div>
                </form>
            </div>

            {/* MODALS */}
            <Modal open={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
                <Box className="update-goods-modal-style">
                    <Typography className="update-goods-modal-header-confirm">Konfirmasi</Typography>
                    <Typography className="update-goods-modal-message">Apakah Anda yakin ingin mengupdate barang ini?</Typography>
                    <div className="update-goods-modal-actions">
                        <Button className="update-goods-modal-btn-cancel" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
                        <Button className="update-goods-modal-btn-confirm" onClick={confirmSubmit}>Confirm</Button>
                    </div>
                </Box>
            </Modal>

            <Modal open={isSuccessModalOpen} onClose={() => navigate("/goods-and-services")}>
                <Box className="update-goods-modal-style">
                    <Typography className="update-goods-modal-header-success">Sukses!</Typography>
                    <Typography className="update-goods-modal-message">Barang berhasil diupdate.</Typography>
                    <div className="update-goods-modal-actions">
                        <Button className="update-goods-modal-btn-cancel" onClick={() => navigate("/goods-and-services")}>Close</Button>
                        {id && (
                            <Button className="update-goods-modal-btn-view" onClick={() => navigate(`/goods-and-services/${id}`)}>View Barang</Button>
                        )}
                    </div>
                </Box>
            </Modal>

            <Modal open={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)}>
                <Box className="update-goods-modal-style">
                    <Typography className="update-goods-modal-header-error">⚠ Error</Typography>
                    <Typography className="update-goods-modal-message">{errorMessage}</Typography>
                    <Button className="update-goods-modal-btn-cancel" onClick={() => setIsErrorModalOpen(false)}>Close</Button>
                </Box>
            </Modal>
        </div>
    );
};

export default UpdateGoods;
