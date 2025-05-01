import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/AddGoodsAndServices.css";
import DeleteIcon from "@mui/icons-material/Delete";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const AddGoodsAndServices = () => {
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
    const [newBarangId, setNewBarangId] = useState(null);
    const [hargaBeli, setHargaBeli] = useState(null);
    const [hargaJual, setHargaJual] = useState(null);

    const token = localStorage.getItem("token");
    if (!token) navigate("/login");

    const fetchGudangOptions = useCallback(async () => {
        try {
            const response = await axiosInstance.get("/api/gudang/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGudangOptions(response.data.data.map(gudang => gudang.nama));
        } catch (error) {
            setErrorMessage("Gagal mengambil daftar gudang.");
            setIsErrorModalOpen(true);
        }
    }, [token]);

    useEffect(() => {
        fetchGudangOptions();
    }, [fetchGudangOptions]);

    const addStockRow = () => {
        setStokList([...stokList, { stock: "", namaGudang: "" }]);
    };

    const updateStockRow = (index, field, value) => {
        const updated = [...stokList];
        updated[index][field] = value;
        setStokList(updated);
    };

    const removeStockRow = (index) => {
        setStokList(stokList.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (
            isActive === null || !nama || !kategori || !merk ||
            !hargaBeli || !hargaJual || stokList.length === 0
        ) {
            setErrorMessage("Semua field harus diisi!");
            setIsErrorModalOpen(true);
            return;
        }

        for (let stok of stokList) {
            if (!stok.namaGudang) {
                setErrorMessage("Harap pilih gudang yang valid!");
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
            const response = await axiosInstance.post("/api/barang/add", requestData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });
            setNewBarangId(response.data.data.id);
            setIsSuccessModalOpen(true);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Gagal menambahkan barang.");
            setIsErrorModalOpen(true);
        }
    };

    return (
        <div className="goods-add-page-container">
            <div className="goods-add-form-container">
                <h1 className="goods-add-page-title">Add Goods & Service</h1>

                <form className="goods-add-form" onSubmit={handleSubmit}>
                    <label className="goods-add-label">Nama Barang:</label>
                    <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required />

                    <label className="goods-add-label">Kategori:</label>
                    <input type="text" value={kategori} onChange={(e) => setKategori(e.target.value)} required />

                    <label className="goods-add-label">Merk:</label>
                    <input type="text" value={merk} onChange={(e) => setMerk(e.target.value)} required />

                    <label className="goods-add-label">Harga Beli:</label>
                    <input type="number" step="0.01" min="1" placeholder="contoh: 12000,50" value={hargaBeli || ""} onChange={(e) => setHargaBeli(e.target.value)} required/>

                    <label className="goods-add-label">Harga Jual:</label>
                    <input type="number" step="0.01" min="1" placeholder="contoh: 15000,75" value={hargaJual || ""} onChange={(e) => setHargaJual(e.target.value)} required/>

                    <label className="goods-add-label">Status Barang:</label>
                    <div className="goods-add-radio-group">
                        <label>
                            <input type="radio" name="isActive" value="true" checked={isActive === true} onChange={(e) => setIsActive(e.target.value === "true")} />
                            Active
                        </label>
                        <label>
                            <input type="radio" name="isActive" value="false" checked={isActive === false} onChange={(e) => setIsActive(e.target.value === "true")} />
                            Inactive
                        </label>
                    </div>

                    <div className="goods-add-stock-section">
                        <h3>Stock Barang per Gudang:</h3>
                        <button type="button" onClick={addStockRow} className="goods-add-btn-stock-add">+ Add</button>
                    </div>

                    {stokList.length > 0 && (
                        <div className="goods-add-scrollable-table">
                            <table className="goods-add-stock-table">
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
                                                <select value={stok.namaGudang} onChange={(e) => updateStockRow(index, "namaGudang", e.target.value)} required>
                                                    <option value="" disabled hidden>Pilih Gudang...</option>
                                                    {gudangOptions.map((gudang, idx) => (
                                                        <option key={idx} value={gudang}>{gudang}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <button type="button" onClick={() => removeStockRow(index)} className="goods-add-btn-delete-stock">
                                                    <DeleteIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="goods-add-button-group">
                        <button type="button" className="goods-add-btn-cancel" onClick={() => navigate("/goods-and-services")}>Cancel</button>
                        <button type="submit" className="goods-add-btn-save">Save</button>
                    </div>
                </form>
            </div>

            {/* MODALS */}
            <Modal open={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
                <Box className="goods-add-modal-style">
                    <Typography className="goods-add-modal-header-confirm">Konfirmasi</Typography>
                    <Typography className="goods-add-modal-message">Apakah Anda yakin ingin menambahkan barang ini?</Typography>
                    <div className="goods-add-modal-actions">
                        <Button className="goods-add-modal-btn-cancel" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
                        <Button className="goods-add-modal-btn-confirm" onClick={confirmSubmit}>Confirm</Button>
                    </div>
                </Box>
            </Modal>

            <Modal open={isSuccessModalOpen} onClose={() => navigate("/goods-and-services")}>
                <Box className="goods-add-modal-style">
                    <Typography className="goods-add-modal-header-success">Sukses!</Typography>
                    <Typography className="goods-add-modal-message">Barang berhasil ditambahkan.</Typography>
                    <div className="goods-add-modal-actions">
                        <Button className="goods-add-modal-btn-cancel" onClick={() => navigate("/goods-and-services")}>Close</Button>
                        {newBarangId && (
                            <Button className="goods-add-modal-btn-view" onClick={() => navigate(`/goods-and-services/${newBarangId}`)}>View Barang</Button>
                        )}
                    </div>
                </Box>
            </Modal>

            <Modal open={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)}>
                <Box className="goods-add-modal-style">
                    <Typography className="goods-add-modal-header-error">⚠ Error</Typography>
                    <Typography className="goods-add-modal-message">{errorMessage}</Typography>
                    <Button className="goods-add-modal-btn-cancel" onClick={() => setIsErrorModalOpen(false)}>Close</Button>
                </Box>
            </Modal>
        </div>
    );
};

export default AddGoodsAndServices;
