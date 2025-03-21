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
        return <h3 className="loading-text">Memuat data barang...</h3>;
    }

    return (
        <div className="page-container-detail">
            <h1 className="page-title-detail">View Goods - ID: {barang.id}</h1>

            <div className="detail-container">
                <div className="detail-content">
                    <div className="info-section left">
                        <p><strong>ID:</strong> {barang.id}</p>
                        <p><strong>Nama:</strong> {barang.nama}</p>
                        <p><strong>Kategori:</strong> {barang.kategori}</p>
                        <p><strong>Merk:</strong> {barang.merk}</p>
                        <p><strong>Status:</strong> {barang.active ? "Aktif" : "Tidak Aktif"}</p>
                    </div>
                    <div className="info-section right">
                        <p><strong>Total Stok:</strong> {barang.totalStock}</p>
                        <p><strong>Tanggal Dibuat:</strong> {barang.createdDate}</p>
                        <p><strong>Terakhir Diperbarui:</strong> {barang.updatedDate}</p>
                    </div>
                </div>

                <div className="stock-gudang-container">
                    <h3>Stok Per Gudang</h3>
                    <div className="stock-gudang-table-wrapper">
                        <table className="stock-gudang-table">
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
                                        <td className={stock.stock === 0 ? "stok-kosong" : ""}>
                                            {stock.stock} unit
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="button-container-detail">
                    <button className="back-btn" onClick={() => navigate("/goods-and-services")}>Back</button>
                    <button className="updt-btn" onClick={() => navigate(`/goods-and-services/update/${barang.id}`)}>Update</button>
                </div>
            </div>
        </div>
    );
};

export default GoodsDetail;
