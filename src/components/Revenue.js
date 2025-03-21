import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Toolbar from "../components/ToolbarRevenue";
import "../styles/GoodsTransport.css";

const Revenue = () => {
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
            const response = await axios.get("http://localhost:8080/api/penerimaan/viewall", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("API Response:", response.data);

            if (Array.isArray(response.data)) {
                setData(response.data);
            } else if (response.data && Array.isArray(response.data.data)) {
                setData(response.data.data);
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
            if (searchCategory === "id") {
                return item.id.toLowerCase().includes(lower);
            } else if (searchCategory === "penerimaan") {
                return item.jenisPenerimaan.toLowerCase().includes(lower);
            } else if (searchCategory === "jumlah") {
                const searchValue = searchTerm.replace(/[^0-9]/g, "");
                if (searchValue === "") return true;
                const jumlahValue = item.jumlah.toString();
                return jumlahValue.includes(searchValue); 
            } else if (searchCategory === "sumber") {
                return item.sumberPenerimaan.toLowerCase().includes(lower);
            } else {
                return (
                    item.id.toLowerCase().includes(lower) ||
                    item.jenisPenerimaan.toLowerCase().includes(lower) ||
                    item.jumlah.toString().includes(searchTerm.replace(/[^0-9]/g, "")) ||
                    item.sumberPenerimaan.toLowerCase().includes(lower)
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
            <h1 className="page-title">Revenue</h1>

            <Toolbar
                onAdd={() => navigate("/create-penerimaan")}
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
                        <th>Jenis Penerimaan</th>
                        <th>Jumlah</th>
                        <th>Sumber Penerimaan</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.length > 0 ? (
                        filteredData.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.jenisPenerimaan}</td>
                                <td>{item.jumlah.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</td>
                                <td>{item.sumberPenerimaan}</td>
                                <td>
                                    <button
                                        className="detail-button"
                                        onClick={() => navigate(`/revenue/detail/${item.id}`)}
                                    >
                                        Detail
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No data available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Revenue;
