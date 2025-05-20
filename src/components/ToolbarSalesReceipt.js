import { useEffect, useState } from "react";
import "../styles/ToolbarGoods.css"; // gunakan styling dari Goods
import refreshIcon from "../assets/Refresh.png";
import SearchIcon from "@mui/icons-material/Search";

const ToolbarPurchaseReceipt = ({ onRefresh, onFilter, onSearch, selectedCategory, searchTerm }) => {
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

  const getPlaceholder = () => {
    return selectedCategory === "amount"
      ? "Contoh: 12500,50"
      : `Search by ${selectedCategory}`;
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
          value={selectedCategory}>
          <option value="all">Filter: All</option>
          <option value="id">Filter: ID Receipt</option>
          <option value="date">Filter: Receipt Date</option>
          <option value="amount">Filter: Amount</option>
        </select>
      </div>

      <div className="toolbar-goods-search-container">
        <input
          type="text"
          placeholder={getPlaceholder()}
          className="toolbar-goods-search-bar"
          value={inputValue}
          onChange={handleSearchChange}
        />
        <SearchIcon className="toolbar-goods-search-icon" />
      </div>
    </div>
  );
};

export default ToolbarPurchaseReceipt;