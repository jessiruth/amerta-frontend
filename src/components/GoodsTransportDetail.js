import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/GoodsTransportDetail.css";

const GoodsTransportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                if (!token) {
                    setError("Unauthorized: Token tidak ditemukan");
                    setLoading(false);
                    return;
                }

                console.log(`Fetching data for ID: ${id}`);

                const response = await axios.get(`http://localhost:8080/api/barang/transfer/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("Detail API Response:", response.data);

                if (response.data && response.data.data) {
                    setData(response.data.data);
                } else {
                    setData(response.data);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching detail:", err);

                if (err.response) {
                    setError(err.response.data.message || "Data tidak ditemukan.");
                } else {
                    setError("Terjadi kesalahan saat mengambil data.");
                }

                setLoading(false);
            }
        };

        fetchDetail();
    }, [id, token]);

    if (loading) {
        return <p className="loading-message">Memuat data...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!data) {
        return <p className="error-message">Data tidak ditemukan.</p>;
    }

    return (
        <div className="goods-transport-detail-container">
            <h1 className="page-title">Detail Pemindahan Barang {data.id}</h1>
            <table className="goods-transport-detail-table">
                <tbody>
                    <tr>
                        <th>ID Pemindahan</th>
                        <td>{data.id}</td>
                    </tr>
                    <tr>
                        <th>Tanggal Pemindahan</th>
                        <td>{new Date(data.tanggalPemindahan).toLocaleDateString("id-ID")}</td>
                    </tr>
                    <tr>
                        <th>Gudang Asal</th>
                        <td>{data.gudangAsal}</td>
                    </tr>
                    <tr>
                        <th>Gudang Tujuan</th>
                        <td>{data.gudangTujuan}</td>
                    </tr>
                </tbody>
            </table>

            <h3 className="page-title">Daftar Barang</h3>
            <table className="goods-transport-list-table">
                <thead>
                    <tr>
                        <th>ID Barang</th>
                        <th>Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    {data.listBarang.length > 0 ? (
                        data.listBarang.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.jumlah}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="2">Tidak ada barang yang dipindahkan</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <button className="back-button" onClick={() => navigate("/goods-transport")}>
                Back
            </button>
        </div>
    );
};

export default GoodsTransportDetail;
