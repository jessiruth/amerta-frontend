import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Toolbar from "../components/Toolbar";
import "../styles/GoodsAndServices.css";

const GoodsAndServices = () => {
    const [allBarangList, setAllBarangList] = useState([]);
    const [displayBarangList, setDisplayBarangList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setErrorMessage("");

        const token = localStorage.getItem("token");
        if (!token) {
            setErrorMessage("Unauthorized: Anda harus login terlebih dahulu.");
            return;
        }

        try {
            const response = await axios.get("http://localhost:8080/api/barang/viewall", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.data && response.data.data.length > 0) {
                setAllBarangList(response.data.data);
                setDisplayBarangList(response.data.data);
            } else {
                setErrorMessage("Tidak ada data barang tersedia.");
            }
        } catch (error) {
            console.error("Error fetching data:", error);

            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage("Terjadi kesalahan saat mengambil data. Silakan coba lagi.");
            }
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);

        const filtered = allBarangList.filter((barang) =>
            barang.nama.toLowerCase().includes(term.toLowerCase())
        );
        setDisplayBarangList(filtered);
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(parseInt(event.target.value));
        setCurrentPage(1);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = displayBarangList.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(displayBarangList.length / itemsPerPage);

    return (
        <div className="page-container-goods">
            <div className="goods-container">
                <h1 className="page-title-goods">Goods & Services</h1>

                <Toolbar
                    onAdd={() => navigate("/goods-and-services/add")}
                    onRefresh={fetchData}
                    onFilter={() => alert("Fitur filter dalam pengembangan")}
                    onSearch={handleSearch}
                    searchPlaceholder={"Search by name..."}
                />

                <div className="pagination-controls">
                    <label>Items per page:</label>
                    <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                        <option value="10">10</option>
                        <option value="20">20</option>
                    </select>
                </div>

                <div className="table-container">
                    {errorMessage ? (
                        <div className="no-data-container">
                            <h3 className="no-data-text">{errorMessage}</h3>
                        </div>
                    ) : currentItems.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nama Barang</th>
                                    <th>Kategori</th>
                                    <th>Merk</th>
                                    <th>Stok</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((barang) => (
                                    <tr key={barang.id}>
                                        <td>{barang.id}</td>
                                        <td>{barang.nama}</td>
                                        <td>{barang.kategori}</td>
                                        <td>{barang.merk}</td>
                                        <td>{barang.totalStock}</td>
                                        <td>
                                            <button 
                                                className="detail-btn" 
                                                onClick={() => navigate(`/goods-and-services/${barang.id}`)}
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-data-container">
                            <h3 className="no-data-text">Tidak ada data barang tersedia.</h3>
                        </div>
                    )}
                </div>

                <div className="pagination">
                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(1)}
                    >
                        First
                    </button>

                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Previous
                    </button>

                    <span>Page {currentPage} of {totalPages}</span>

                    <button 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </button>

                    <button 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(totalPages)}
                    >
                        Last
                    </button>
                </div>
            </div>
        </div>
    );    
};

export default GoodsAndServices;
