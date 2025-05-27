import { useState, useEffect } from "react";
import "../styles/ToolbarGoods.css";
import addIcon from "../assets/Add.png";
import refreshIcon from "../assets/Refresh.png";
import SearchIcon from "@mui/icons-material/Search";

const ToolbarRevenue = ({ onAdd, onRefresh, onFilter, onSearch, selectedCategory, searchTerm }) => {
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
    if (selectedCategory === "harga jual" || selectedCategory === "harga beli") {
      return "Contoh: 12500,50";
    }
    if (selectedCategory === "stok") {
      return "Contoh: 10";
    }
    return `Search by ${selectedCategory}`;
  };

  return (
    <div className="toolbar-goods">
      <div className="toolbar-goods-item">
        <button className="toolbar-goods-btn add-btn" onClick={onAdd}>
          <img src={addIcon} alt="Add" />
        </button>
        <p className="toolbar-goods-text">Add</p>
      </div>

      <div className="toolbar-goods-item">
        <button className="toolbar-goods-btn white-btn" onClick={onRefresh}>
          <img src={refreshIcon} alt="Refresh" />
        </button>
        <p className="toolbar-goods-text">Refresh</p>
      </div>

      <div className="toolbar-goods-item filter-container">
        <select className="toolbar-goods-dropdown" onChange={handleCategoryChange} value={selectedCategory}>
          <option value="all">Filter: All</option>
          <option value="penerimaan">Filter: Jenis</option>
          <option value="jumlah">Filter: Jumlah Harga</option>
          <option value="tanggal">Filter: Tanggal</option>
          <option value="sumber">Filter: Sumber</option>
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

export default ToolbarRevenue;