import { useEffect, useState } from "react";
import "../styles/ToolbarGoods.css"; // reuse toolbar goods styling
import refreshIcon from "../assets/Refresh.png";
import SearchIcon from "@mui/icons-material/Search";

const ToolbarInvoice = ({ onRefresh, onFilter, onSearch, selectedCategory, searchTerm }) => {
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

    const getPlaceholderText = () => {
        if (selectedCategory === "jumlah" || selectedCategory === "sisa") {
            return "Contoh: 12500,50";
        } else if (selectedCategory === "payment terms") {
            return "Contoh: 10";
        }
        return `Search by ${selectedCategory}`;
    };

    return (
        <div className="toolbar-goods">
            {/* Refresh Button */}
            <div className="toolbar-goods-item">
                <button className="toolbar-goods-btn white-btn" onClick={onRefresh}>
                    <img src={refreshIcon} alt="Refresh" />
                </button>
                <p className="toolbar-goods-text">Refresh</p>
            </div>

            {/* Filter Dropdown */}
            <div className="toolbar-goods-item filter-container">
                <select className="toolbar-goods-dropdown" onChange={handleCategoryChange} value={selectedCategory}>
                    <option value="all">Filter: All</option>
                    <option value="id">Filter: ID Invoice</option>
                    <option value="status">Filter: Status</option>
                    <option value="due date">Filter: Jatuh Tempo</option>
                    <option value="payment terms">Filter: Sisa Hari</option>
                    <option value="jumlah">Filter: Jumlah Bayar</option>
                    <option value="sisa">Filter: Sisa Bayar</option>
                </select>
            </div>

            {/* Search Bar */}
            <div className="toolbar-goods-search-container">
                <input
                    type="text"
                    placeholder={getPlaceholderText()}
                    className="toolbar-goods-search-bar"
                    value={inputValue}
                    onChange={handleSearchChange}
                />
                <SearchIcon className="toolbar-goods-search-icon" />
            </div>
        </div>
    );
};

export default ToolbarInvoice;
