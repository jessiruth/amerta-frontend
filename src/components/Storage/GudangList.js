import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../ToolbarGudang";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/GudangList.css";

const GudangList = () => {
    const [gudangList, setGudangList] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchCategory, setSearchCategory] = useState("all");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const fetchGudangList = useCallback(async (token) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/api/gudang/", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data && response.data.data) {
                setGudangList(response.data.data);
                setFilteredData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching gudang list:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }
        fetchGudangList(token);
    }, [navigate, fetchGudangList]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase().trim();
        const numberOnly = searchTerm.replace(/[^0-9]/g, "");

        const filtered = gudangList.filter((item) => {
            if (!lower) return true;

            if (searchCategory === "nama") {
                return item.nama.toLowerCase() === lower;
            } else if (searchCategory === "kota") {
                return item.alamatGudang?.kota?.toLowerCase() === lower;
            } else if (searchCategory === "provinsi") {
                return item.alamatGudang?.provinsi?.toLowerCase() === lower;
            } else if (searchCategory === "kapasitas") {
                return numberOnly && item.kapasitas.toString() === numberOnly;
            } else if (searchCategory === "all") {
                return (
                    item.nama.toLowerCase().includes(lower) ||
                    item.alamatGudang?.kota?.toLowerCase().includes(lower) ||
                    item.alamatGudang?.provinsi?.toLowerCase().includes(lower) ||
                    (numberOnly && item.kapasitas.toString().includes(numberOnly))
                );
            }

            return true;
        });

        setFilteredData(filtered);
    }, [searchTerm, searchCategory, gudangList]);



    const handleRefresh = () => {
        setSearchTerm("");
        setSearchCategory("all");
        setFilteredData(gudangList);
        const token = localStorage.getItem("token");
        if (token) {
            fetchGudangList(token);
        }
    };

    return (
        <div className="gudang-list-container">
            <div className="gudang-list-content">
                <h1 className="page-title">Storage</h1>

                <Toolbar
                    onAdd={() => navigate("/gudang/add")}
                    onRefresh={handleRefresh}
                    onFilter={(category) => setSearchCategory(category)}
                    onSearch={(term) => setSearchTerm(term)}
                    selectedCategory={searchCategory}
                    searchTerm={searchTerm}
                />

                <div className="table-container">
                    <div className="table-header">
                        <h2>Storage</h2>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <p>Loading...</p>
                        </div>
                    ) : (
                        <table className="gudang-table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Kota</th>
                                    <th>Provinsi</th>
                                    <th>Kapasitas</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((gudang) => (
                                        <tr key={gudang.nama}>
                                            <td>{gudang.nama}</td>
                                            <td>{gudang.alamatGudang?.kota || "-"}</td>
                                            <td>{gudang.alamatGudang?.provinsi || "-"}</td>
                                            <td>{parseFloat(gudang.kapasitas).toLocaleString("id-ID")}</td>
                                            <td>
                                                <button
                                                    className="detail-btn"
                                                    onClick={() => navigate(`/gudang/${gudang.nama}`)}
                                                >
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="no-data">
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GudangList;