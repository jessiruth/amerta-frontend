import { useEffect, useState } from "react";
import "../../styles/ToolbarGoods.css";
import refreshIcon from "../../assets/Refresh.png";
import SearchIcon from "@mui/icons-material/Search";

const ToolbarSales = ({ onAdd, onRefresh, onFilter, onSearch, selectedCategory, searchTerm }) => {
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
        if (selectedCategory === "price") {
            return "Contoh: 12500,50";
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
                    <option value="all">Filter: Semua Kolom</option>
                    <option value="id">Filter: ID SO</option>
                    <option value="customer">Filter: Nama Customer</option>
                    <option value="date">Filter: Tanggal</option>
                    <option value="price">Filter: Total Harga</option>
                    <option value="status">Filter: Status</option>
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

export default ToolbarSales;
