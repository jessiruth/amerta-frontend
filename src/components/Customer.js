import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/ToolbarGoodsTransport";
import "../styles/Employee.css";
import axiosInstance from "../services/axiosInstance";

const Customer = () => {
    const [customer, setCustomer] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/");
        }
    }, [navigate, token]);

    const fetchCustomers = useCallback(async () => {
        try {
            const response = await axiosInstance.get("/api/customer/viewall?role=", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("API Response:", response.data);

            if (response.data && Array.isArray(response.data.data)) {
                setCustomer(response.data.data);
            } else {
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    }, [token]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleRowClick = (customerId) => {
        navigate(`/customer/${customerId}`);
    };

    const handleEditClick = (e, customerId) => {
        e.stopPropagation(); // Prevent row click when clicking edit button
        navigate(`/customer/update/${customerId}`);
    };

    return (
        <div className="employee-container">
            <h1 className="page-title">Customer</h1>

            <Toolbar
                onAdd={() => navigate("/customer/add")}
                onRefresh={fetchCustomers}
                onFilter={() => console.log("Filter Clicked")}
                onSearch={(term) => console.log("Search:", term)}
            />

            <table className="employee-table">
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
                    {customer.length > 0 ? (
                        customer.map((customer) => (
                            <tr 
                                key={customer.id} 
                                onClick={() => handleRowClick(customer.id)}
                                className="clickable-row"
                            >
                                <td>{customer.name}</td>
                                <td>{customer.role}</td>
                                <td>{customer.email}</td>
                                <td>{customer.phone}</td>
                                <td>{customer.whatsapp}</td>
                                <td>
                                    <button
                                        className="edit-button"
                                        onClick={(e) => handleEditClick(e, customer.id)}
                                    >
                                        Edit
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

export default Customer;
