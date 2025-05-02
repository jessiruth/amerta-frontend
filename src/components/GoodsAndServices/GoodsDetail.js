import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/GoodsDetail.css";
import axiosInstance from "../../services/axiosInstance";

const GoodsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [barang, setBarang] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        axiosInstance.get(`/api/barang/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
            setBarang(response.data.data);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
    }, [id, navigate]);

    if (!barang) {
        return <h3 className="goods-detail-loading-text">Memuat data barang...</h3>;
    }

    return (
        <div className="goods-detail-page-container">
            <h1 className="goods-detail-page-title">View Goods - ID: {barang.id}</h1>

            <div className="goods-detail-container">
                <div className="goods-detail-content">
                    <div className="goods-detail-info left">
                        <p><strong>ID:</strong> {barang.id}</p>
                        <p><strong>Nama:</strong> {barang.nama}</p>
                        <p><strong>Kategori:</strong> {barang.kategori}</p>
                        <p><strong>Merk:</strong> {barang.merk}</p>
                        <p><strong>Status:</strong> {barang.active ? "Aktif" : "Tidak Aktif"}</p>
                        <p><strong>Total Stok:</strong> {barang.totalStock}</p>
                    </div>

                    <div className="goods-detail-info right">
                        <p><strong>Harga Beli:</strong> Rp{barang.hargaBeli?.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</p>
                        <p><strong>Harga Jual:</strong> Rp{barang.hargaJual?.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</p>
                        <p><strong>Tanggal Dibuat:</strong> {barang.createdDate}</p>
                        <p><strong>Terakhir Diperbarui:</strong> {barang.updatedDate}</p>
                    </div>
                </div>

                <div className="goods-detail-stock-container">
                    <h3>Stok Per Gudang</h3>
                    <div className="goods-detail-stock-table-wrapper">
                        <table className="goods-detail-stock-table">
                            <thead>
                                <tr>
                                    <th>Gudang</th>
                                    <th>Stok</th>
                                </tr>
                            </thead>
                            <tbody>
                                {barang.stockBarang.map((stock, index) => (
                                    <tr key={index}>
                                        <td>{stock.namaGudang}</td>
                                        <td className={stock.stock === 0 ? "goods-detail-stok-kosong" : ""}>
                                            {stock.stock} unit
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="goods-detail-button-container">
                    <button className="goods-detail-btn-back" onClick={() => navigate("/goods-and-services")}>Back</button>
                    <button className="goods-detail-btn-update" onClick={() => navigate(`/goods-and-services/update/${barang.id}`)}>Update</button>
                </div>
            </div>
        </div>
    );
};

export default GoodsDetail;
