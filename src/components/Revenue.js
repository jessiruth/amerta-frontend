import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Toolbar from "../components/ToolbarRevenue";
import "../styles/GudangList.css";

const Revenue = () => {
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
            const response = await axiosInstance.get("/api/penerimaan/viewall", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("API Response:", response.data);

            if (Array.isArray(response.data)) {
                setData(response.data);
                setFilteredData(response.data);
            } else if (response.data && Array.isArray(response.data.data)) {
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
        const numeric = parseFloat(searchTerm.replace(",", "."));

        const filtered = data.filter((item) => {
            if (!lower) return true;

            switch (searchCategory) {
                case "penerimaan":
                    return item.jenisPenerimaan?.toLowerCase() === lower;
                case "jumlah":
                    return !isNaN(numeric) && parseFloat(item.jumlah) === numeric;
                case "tanggal":
                    const formattedTanggal = new Date(item.tanggal).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }).toLowerCase();

                    return formattedTanggal.includes(lower);
                case "sumber":
                    return item.sumberPenerimaan?.toLowerCase() === lower;
                case "all":
                default:
                    const fullDate = new Date(item.tanggal).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }).toLowerCase();
                    return (
                        item.jenisPenerimaan?.toLowerCase().includes(lower) ||
                        item.jumlah?.toString().replace(".",",").includes(searchTerm) ||
                        fullDate.includes(lower) ||
                        item.sumberPenerimaan?.toLowerCase().includes(lower)
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
            <h1 className="page-title">Revenue</h1>

            <Toolbar
                onAdd={() => navigate("/create-penerimaan")}
                onRefresh={handleRefresh}
                onFilter={(category) => setSearchCategory(category)}
                onSearch={(term) => setSearchTerm(term)}
                selectedCategory={searchCategory}
                searchTerm={searchTerm}
            />

            <div className="table-container">
                <div className="table-header">
                    <h2>Revenue Table</h2>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <p>Loading...</p>
                    </div>
                ) : (
                    <table className="gudang-table">
                        <thead>
                            <tr>
                                <th>Jenis Penerimaan</th>
                                <th>Jumlah</th>
                                <th>Tanggal Penerimaan</th>
                                <th>Sumber Penerimaan</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.jenisPenerimaan}</td>
                                        <td>Rp{parseFloat(item.jumlah).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                                        <td>{new Date(item.tanggal).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</td>
                                        <td>{item.sumberPenerimaan}</td>
                                        <td>
                                            <button
                                                className="detail-btn"
                                                onClick={() => navigate(`/revenue/detail/${item.id}`)}
                                            >
                                                Detail
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

export default Revenue;
