import { useEffect, useState } from "react";
import "../styles/ToolbarGoods.css"; // gunakan styling ToolbarGoods
import addIcon from "../assets/Add.png";
import refreshIcon from "../assets/Refresh.png";
import SearchIcon from "@mui/icons-material/Search";

const ToolbarGudang = ({ onAdd, onRefresh, onFilter, onSearch, selectedCategory, searchTerm }) => {
    const [inputValue, setInputValue] = useState("");
    const role = localStorage.getItem("role")?.toLowerCase();

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
        if (selectedCategory === "kapasitas") {
            return "Contoh: 3000";
        } 
        return `Search by ${selectedCategory}`;
    };

    return (
        <div className="toolbar-goods">
            {/* Add Button */}
            {!["komisaris"].includes(role) && (
                <div className="toolbar-goods-item">
                <button className="toolbar-goods-btn add-btn" onClick={onAdd}>
                    <img src={addIcon} alt="Add" />
                </button>
                <p className="toolbar-goods-text">Add</p>
                </div>
            )}
            
            {/* Refresh Button */}
            <div className="toolbar-goods-item">
                <button className="toolbar-goods-btn white-btn" onClick={onRefresh}>
                    <img src={refreshIcon} alt="Refresh" />
                </button>
                <p className="toolbar-goods-text">Refresh</p>
            </div>

            {/* Filter Dropdown */}
            <div className="toolbar-goods-item filter-container">
                <select
                    className="toolbar-goods-dropdown"
                    onChange={handleCategoryChange}
                    value={selectedCategory}>
                    <option value="all">Filter: All</option>
                    <option value="nama">Filter: Nama</option>
                    <option value="kota">Filter: Kota</option>
                    <option value="provinsi">Filter: Provinsi</option>
                    <option value="kapasitas">Filter: Kapasitas</option>
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

export default ToolbarGudang;