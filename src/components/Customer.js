import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/ToolbarCustomer";
import "../styles/GoodsTransport.css";
import axiosInstance from "../services/axiosInstance";

const Customer = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
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

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/api/customer/viewall?role=", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data && Array.isArray(response.data.data)) {
                setCustomers(response.data.data);
                setFilteredCustomers(response.data.data);
            } else {
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase().trim();

        const filtered = customers.filter((cust) => {
            if (!lower) return true;

            switch (searchCategory) {
                case "nama":
                    return cust.name?.toLowerCase() === lower;
                case "email":
                    return cust.email?.toLowerCase() === lower;
                case "role":
                    return cust.role?.toLowerCase() === lower;
                case "no_hp":
                    return cust.phone?.toLowerCase() === lower;
                case "wa":
                    return cust.whatsapp?.toLowerCase() === lower;
                case "all":
                default:
                    return (
                        cust.name?.toLowerCase().includes(lower) ||
                        cust.email?.toLowerCase().includes(lower) ||
                        cust.role?.toLowerCase().includes(lower) ||
                        cust.phone?.toLowerCase().includes(lower) ||
                        cust.whatsapp?.toLowerCase().includes(lower)
                    );
            }
        });

        setFilteredCustomers(filtered);
    }, [searchTerm, searchCategory, customers]);

    const handleRefresh = () => {
        setSearchTerm("");
        setSearchCategory("all");
        fetchCustomers();
    };

    return (
        <div className="employee-container">
            <h1 className="page-title">Customer Relationship Management</h1>

            <Toolbar
                onAdd={() => navigate("/customer/add")}
                onRefresh={handleRefresh}
                onFilter={(category) => setSearchCategory(category)}
                onSearch={(term) => setSearchTerm(term)}
                selectedCategory={searchCategory}
                searchTerm={searchTerm}
            />

            <div className="table-container">
                <div className="table-header">
                    <h2>Customer / Vendor List</h2>
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
                                <th>Role</th>
                                <th>Email</th>
                                <th>Handphone</th>
                                <th>Whatsapp Number</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td>{customer.name}</td>
                                        <td>{customer.role}</td>
                                        <td>{customer.email}</td>
                                        <td>{customer.phone}</td>
                                        <td>{customer.whatsapp}</td>
                                        <td>
                                            <button
                                                className="detail-btn"
                                                onClick={() => navigate(`/customer/${customer.id}`)}
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="no-data">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Customer;