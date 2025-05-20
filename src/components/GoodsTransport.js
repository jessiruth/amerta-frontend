import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Toolbar from "../components/ToolbarGoodsTransport";
import "../styles/GoodsTransport.css";

const GoodsTransport = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchCategory, setSearchCategory] = useState("all");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/");
        }
    }, [navigate, token]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/api/barang/transfer/viewall", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data && response.data.data) {
                setData(response.data.data);
                setFilteredData(response.data.data);
            } else {
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase().trim();

        const filtered = data.filter((item) => {
            if (!lower) return true;

            if (searchCategory === "tanggal") {
                return item.tanggalPemindahan.toLowerCase().includes(lower);
            } else if (searchCategory === "asal") {
                return item.gudangAsal.toLowerCase() === lower;
            } else if (searchCategory === "tujuan") {
                return item.gudangTujuan.toLowerCase() === lower;
            } else {
                return (
                    item.tanggalPemindahan.toLowerCase().includes(lower) ||
                    item.gudangAsal.toLowerCase().includes(lower) ||
                    item.gudangTujuan.toLowerCase().includes(lower)
                );
            }
        });

        setFilteredData(filtered);
    }, [searchTerm, searchCategory, data]);

    const handleRefresh = () => {
        setSearchTerm("");
        setSearchCategory("all");
        setFilteredData(data);
        fetchData();
    };

    return (
        <div className="gudang-list-container">
            <h1 className="page-title">Goods Transport</h1>

            <Toolbar
                onAdd={() => navigate("/goods-transport/add")}
                onRefresh={handleRefresh}
                onFilter={(category) => setSearchCategory(category)}
                onSearch={(term) => setSearchTerm(term)}
                selectedCategory={searchCategory}
                searchTerm={searchTerm}
            />

            <div className="table-container">
                <div className="table-header">
                    <h2>Transport</h2>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <p>Loading...</p>
                    </div>
                ) : (
                    <table className="gudang-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date of Transfer</th>
                                <th>Gudang Asal</th>
                                <th>Gudang Tujuan</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.tanggalPemindahan}</td>
                                        <td>{item.gudangAsal}</td>
                                        <td>{item.gudangTujuan}</td>
                                        <td>
                                            <button
                                                className="detail-btn"
                                                onClick={() => navigate(`/goods-transport/detail/${item.id}`)}
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-data">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default GoodsTransport;
