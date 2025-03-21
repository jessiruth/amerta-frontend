import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

    useEffect(() => {
        fetchGudangOptions();
    }, []);

    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/login");
    }

    const fetchGudangOptions = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/gudang/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGudangOptions(response.data.data.map(gudang => gudang.nama));
        } catch (error) {
            console.error("Error fetching gudang data:", error);
            setErrorMessage("Gagal mengambil daftar gudang. Pastikan Anda memiliki akses.");
            setIsErrorModalOpen(true);
        }
    };

    const addStockRow = () => {
        setStokList([...stokList, { stock: "", namaGudang: "" }]);
    };

    const updateStockRow = (index, field, value) => {
        const updatedStokList = [...stokList];
        updatedStokList[index][field] = value;
        setStokList(updatedStokList);
    };

    const removeStockRow = (index) => {
        setStokList(stokList.filter((_, i) => i !== index));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        setErrorMessage("");

        if (isActive === null) {
            setErrorMessage("Harap pilih status barang!");
            setIsErrorModalOpen(true);
            return;
        }
        
        if (!nama || !kategori || !merk || stokList.length === 0) {
            setErrorMessage("Semua field harus diisi!");
            setIsErrorModalOpen(true);
            return;
        }

        for (let stok of stokList) {
            if (!stok.namaGudang) {
                setErrorMessage("Harap pilih gudang yang valid untuk setiap stok!");
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
            isActive,
            merk,
            listStockBarang: stokList.map(({ stock, namaGudang }) => ({
                stock: parseInt(stock),
                namaGudang
            }))
        };

        try {
            const response = await axios.post("http://localhost:8080/api/barang/add", requestData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            setNewBarangId(response.data.data.id);
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error("Error adding barang:", error);
            setErrorMessage(
                error.response?.data?.message || "Terjadi kesalahan saat menambahkan barang."
            );
            setIsErrorModalOpen(true);
        }
    };

    return (
        <div className="page-container-add-goods">
            <div className="form-container">
                <h1 className="page-title-add-goods">Add Goods & Service</h1>

                <form onSubmit={handleSubmit}>
                    <label>Nama Barang:</label>
                    <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required />

                    <label>Kategori:</label>
                    <input type="text" value={kategori} onChange={(e) => setKategori(e.target.value)} required />

                    <label>Merk:</label>
                    <input type="text" value={merk} onChange={(e) => setMerk(e.target.value)} required />

                    <label>Status Barang:</label>
                    <div className="radio-group">
                        <label>
                            <input type="radio" name="isActive" value="true" checked={isActive === true} onChange={() => setIsActive(true)} />
                            Active
                        </label>
                        <label>
                            <input type="radio" name="isActive" value="false" checked={isActive === false} onChange={() => setIsActive(false)} />
                            Inactive
                        </label>
                    </div>

                    <div className="stock-section">
                        <h3>Stock Barang per Gudang:</h3>
                        <button type="button" onClick={addStockRow} className="add-stock-btn">+ Add</button>
                    </div>
                    
                    {stokList.length > 0 && (
                        <div className="scrollable-table">
                            <table className="stock-table">
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
                                                    <option value="" disabled hidden>
                                                        Pilih Gudang...
                                                    </option>
                                                    {gudangOptions.map((gudang, idx) => (
                                                        <option key={idx} value={gudang}>{gudang}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <button type="button" onClick={() => removeStockRow(index)} className="delete-stock-btn">
                                                    <DeleteIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="button-group">
                        <button type="button" className="cancel-btn" onClick={() => navigate("/goods-and-services")}>Cancel</button>
                        <button type="submit" className="save-btn">Save</button>
                    </div>
                </form>
            </div>

           <Modal open={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
                <Box className="modal-style">
                    <Typography className="modal-header-confirm">Konfirmasi</Typography>
                    <Typography className="modal-message">Apakah Anda yakin ingin menambahkan barang ini?</Typography>
                    <div className="modal-actions">
                        <Button className="modal-close-btn-confirm-success" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
                        <Button className="modal-confirm-btn-confirm-success" onClick={confirmSubmit}>Confirm</Button>
                    </div>
                </Box>
            </Modal>

            <Modal open={isSuccessModalOpen} onClose={() => navigate("/goods-and-services")}>
                <Box className="modal-style">
                    <Typography className="modal-header-success">Sukses!</Typography>
                    <Typography className="modal-message">Barang berhasil ditambahkan.</Typography>
                    <div className="modal-actions">
                        <Button className="modal-close-btn-confirm-success" onClick={() => navigate("/goods-and-services")}>Close</Button>
                        {newBarangId && (
                            <Button className="view-btn" onClick={() => navigate(`/goods-and-services/${newBarangId}`)}>View Barang</Button>
                        )}
                    </div>
                </Box>
            </Modal>

            <Modal open={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)}>
                <Box className="modal-style">
                    <Typography className="modal-header-error">⚠ Error</Typography>
                    <Typography className="modal-message">{errorMessage}</Typography>
                    <Button className="modal-close-btn" onClick={() => setIsErrorModalOpen(false)}>Close</Button>
                </Box>
            </Modal>
        </div>
    );
};

export default AddGoodsAndServices;
