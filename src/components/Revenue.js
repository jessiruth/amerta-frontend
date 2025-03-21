import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Toolbar from "./Toolbar";
import "../styles/GoodsTransport.css";

const Revenue = () => {
    const [data, setData] = useState([]);
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

    return (
        <div className="goods-transport-container">
            <h1 className="page-title">Revenue</h1>

            <Toolbar
                onAdd={() => navigate("/create-penerimaan")}
                onRefresh={fetchData}
                onFilter={() => console.log("Filter Clicked")}
                onSearch={(term) => console.log("Search:", term)}
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
                    {data.length > 0 ? (
                        data.map((item) => (
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
