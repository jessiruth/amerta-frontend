import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Toolbar from "../components/Toolbar";
import "../styles/GoodsTransport.css";

const GoodsTransport = () => {
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
            const response = await axios.get("http://localhost:8080/api/barang/transfer/viewall", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("API Response:", response.data);

            if (response.data && response.data.data) {
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
            <h1 className="page-title">Goods Transport</h1>

            <Toolbar
                onAdd={() => navigate("/goods-transport/add")}
                onRefresh={fetchData}
                onFilter={() => console.log("Filter Clicked")}
                onSearch={(term) => console.log("Search:", term)}
            />

            <table className="goods-transport-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date of Transfer</th>
                        <th>Gudang Asal</th>
                        <th>Gudang Tujuan</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.tanggalPemindahan}</td>
                                <td>{item.gudangAsal}</td>
                                <td>{item.gudangTujuan}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No data available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default GoodsTransport;
