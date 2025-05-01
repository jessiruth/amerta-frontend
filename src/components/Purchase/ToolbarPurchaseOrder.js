import { useState, useEffect } from "react";
import "../../styles/ToolbarPurchaseOrder.css";
import addIcon from "../../assets/Add.png";
import refreshIcon from "../../assets/Refresh.png";
import SearchIcon from "@mui/icons-material/Search";

const ToolbarPurchaseOrder = ({
    onAdd,
    onRefresh,
    onFilter,
    onSearch,
    selectedCategory,
    searchTerm,
}) => {
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
        <div className="toolbar-purchase-order">
            <div className="toolbar-purchase-order-item">
                <button className="toolbar-purchase-order-btn add-btn" onClick={onAdd}>
                    <img src={addIcon} alt="Add" />
                </button>
                <p className="toolbar-purchase-order-text">Add</p>
            </div>

            <div className="toolbar-purchase-order-item">
                <button className="toolbar-purchase-order-btn white-btn" onClick={onRefresh}>
                    <img src={refreshIcon} alt="Refresh" />
                </button>
                <p className="toolbar-purchase-order-text">Refresh</p>
            </div>

            <div className="toolbar-purchase-order-item filter-container">
                <select
                    className="toolbar-purchase-order-dropdown"
                    onChange={handleCategoryChange}
                    value={selectedCategory}>
                    <option value="all">Filter: Semua Kolom</option>
                    <option value="id">Filter: ID PO</option>
                    <option value="vendor">Filter: Vendor</option>
                    <option value="date">Filter: Tanggal Beli</option>
                    <option value="price">Filter: Total Harga</option>
                    <option value="status">Filter: Status</option>
                </select>
            </div>

            <div className="toolbar-purchase-order-search-container">
                <input
                    type="text"
                    placeholder={`Search by ${selectedCategory}`}
                    className="toolbar-purchase-order-search-bar"
                    value={inputValue}
                    onChange={handleSearchChange}
                />
                <SearchIcon className="toolbar-purchase-order-search-icon" />
            </div>
        </div>
    );
};

export default ToolbarPurchaseOrder;
