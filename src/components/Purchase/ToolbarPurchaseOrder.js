import { useState, useEffect } from "react";
import "../../styles/ToolbarGoods.css"; // Reuse styling from ToolbarGoods
import refreshIcon from "../../assets/Refresh.png";
import SearchIcon from "@mui/icons-material/Search";

const ToolbarPurchaseOrder = ({
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

  const getPlaceholderText = () => {
    if (selectedCategory === "price") {
      return "Contoh: 12500,50";
    }
    return `Search by ${selectedCategory}`;
  };

  return (
    <div className="toolbar-goods">
      <div className="toolbar-goods-item">
        <button className="toolbar-goods-btn white-btn" onClick={onRefresh}>
          <img src={refreshIcon} alt="Refresh" />
        </button>
        <p className="toolbar-goods-text">Refresh</p>
      </div>

      <div className="toolbar-goods-item filter-container">
        <select
          className="toolbar-goods-dropdown"
          onChange={handleCategoryChange}
          value={selectedCategory}
        >
          <option value="all">Filter: All</option>
          <option value="id">Filter: ID PO</option>
          <option value="vendor">Filter: Vendor</option>
          <option value="date">Filter: Tanggal Beli</option>
          <option value="price">Filter: Total Harga</option>
          <option value="status">Filter: Status</option>
        </select>
      </div>

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

export default ToolbarPurchaseOrder;
