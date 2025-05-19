import { useEffect, useState } from "react";
import "../styles/ToolbarGoods.css"; // reuse styling from ToolbarGoods
import refreshIcon from "../assets/Refresh.png";
import SearchIcon from "@mui/icons-material/Search";

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

  const getPlaceholder = () => {
    return selectedCategory === "deliveryfee"
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
          <option value="id">Filter: ID Delivery</option>
          <option value="vendor">Filter: Nama Vendor</option>
          <option value="date">Filter: Tanggal Pengiriman</option>
          <option value="status">Filter: Status Pengiriman</option>
          <option value="resi">Filter: Nomor Resi</option>
          <option value="deliveryfee">Filter: Biaya Pengiriman</option>
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

export default ToolbarDelivery;