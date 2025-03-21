import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import "../styles/ExpenseDetail.css";

const ExpenseDetail = () => {
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

                const response = await axiosInstance.get(`/api/pengeluaran/view/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("Detail API Response:", response.data);

                setData(response.data);
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
        <div className="expense-detail-container">
            <h2>Detail Pengeluaran {data.id}</h2>
            <table className="expense-detail-table">
                <tbody>
                    <tr>
                        <th>Jenis Pengeluaran</th>
                        <td>{data.jenisPengeluaran}</td>
                    </tr>
                    <tr>
                        <th>Jumlah</th>
                        <td>{data.jumlah.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</td>
                    </tr>
                    <tr>
                        <th>Tanggal</th>
                        <td>{new Date(data.tanggal).toLocaleDateString("id-ID")}</td>
                    </tr>
                    <tr>
                        <th>Penanggung Jawab</th>
                        <td>{data.penanggung_jawab}</td>
                    </tr>
                    <tr>
                        <th>Keterangan</th>
                        <td>{data.keterangan}</td>
                    </tr>
                </tbody>
            </table>

            <button className="back-button" onClick={() => navigate("/expense")}>
                Back
            </button>
        </div>
    );
};

export default ExpenseDetail;
