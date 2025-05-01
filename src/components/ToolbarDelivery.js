import { useEffect, useState } from "react";
import "../styles/Toolbar.css";
import refreshIcon from "../assets/Refresh.png";

const ToolbarDelivery = ({ onRefresh, onFilter, onSearch, selectedCategory, searchTerm }) => {
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        setInputValue(searchTerm);
    }, [searchTerm]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        onSearch(value);
    };

    const handleCategoryChange = (e) => {
        onFilter(e.target.value);
    };

    return (
        <div className="toolbar">
            {/* Refresh Button */}
            <div className="toolbar-item">
                <button className="toolbar-btn white-btn" onClick={onRefresh}>
                    <img src={refreshIcon} alt="Refresh" />
                </button>
                <p className="toolbar-text">Refresh</p>
            </div>

            {/* Filter Dropdown */}
            <div className="toolbar-item filter-container">
                <select className="filter-dropdown" onChange={handleCategoryChange} value={selectedCategory}>
                    <option value="all">Filter: Semua Kolom</option>
                    <option value="id">Filter: ID Sales Order</option>
                    <option value="customer">Filter: Nama Vendor</option>
                    <option value="date">Filter: Tanggal Pengiriman</option>
                    <option value="status">Filter: Status Pengiriman</option>
                </select>
            </div>

            {/* Search Bar */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder={`Cari berdasarkan ${selectedCategory}`}
                    className="search-bar"
                    value={inputValue}
                    onChange={handleSearchChange}
                />
                <span className="search-icon">🔍</span>
            </div>
        </div>
    );
};

export default ToolbarDelivery;