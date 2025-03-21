import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from '../services/axiosInstance';
import Toolbar from "../components/ToolbarGoodsTransport";
import "../styles/GoodsTransport.css";

const GoodsTransport = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchCategory, setSearchCategory] = useState("all");

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/");
        }
    }, [navigate, token]);

    const fetchData = useCallback(async () => {
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
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();

        const filtered = data.filter((item) => {
            if (searchCategory === "tanggal") {
                return item.tanggalPemindahan.toLowerCase().includes(lower);
            } else if (searchCategory === "asal") {
                return item.gudangAsal.toLowerCase().includes(lower);
            } else if (searchCategory === "tujuan") {
                return item.gudangTujuan.toLowerCase().includes(lower);
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
        <div className="goods-transport-container">
            <h1 className="page-title">Goods Transport</h1>

            <Toolbar
                onAdd={() => navigate("/goods-transport/add")}
                onRefresh={handleRefresh}
                onFilter={(category) => setSearchCategory(category)}
                onSearch={(term) => setSearchTerm(term)}
                selectedCategory={searchCategory}
                searchTerm={searchTerm}
            />

            <table className="goods-transport-table">
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
                                        className="detail-button"
                                        onClick={() => navigate(`/goods-transport/detail/${item.id}`)}
                                    >
                                        Detail
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No data available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default GoodsTransport;
