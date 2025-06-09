import { useEffect, useState } from "react";
import "../styles/ToolbarGoods.css"; // gunakan CSS yang sudah kamu berikan
import addIcon from "../assets/Add.png";
import refreshIcon from "../assets/Refresh.png";
import SearchIcon from "@mui/icons-material/Search";

const ToolbarGoodsTransport = ({ onAdd, onRefresh, onFilter, onSearch, selectedCategory, searchTerm }) => {
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

  return (
    <div className="toolbar-goods">
      {/* Tombol Tambah */}
      {!["kepala_gudang", "komisaris", "administrasi"].includes(role) && (
        <div className="toolbar-goods-item">
          <button className="toolbar-goods-btn add-btn" onClick={onAdd}>
            <img src={addIcon} alt="Add" />
          </button>
          <p className="toolbar-goods-text">Add</p>
        </div>
      )}

      {/* Tombol Refresh */}
      <div className="toolbar-goods-item">
        <button className="toolbar-goods-btn white-btn" onClick={onRefresh}>
          <img src={refreshIcon} alt="Refresh" />
        </button>
        <p className="toolbar-goods-text">Refresh</p>
      </div>

      {/* Dropdown Filter */}
      <div className="toolbar-goods-item">
        <select
          className="toolbar-goods-dropdown"
          onChange={handleCategoryChange}
          value={selectedCategory}
        >
          <option value="all">Filter: All</option>
          <option value="id">Filter: ID</option>
          <option value="tanggal">Filter: Tanggal Pindah</option>
          <option value="asal">Filter: Gudang Asal</option>
          <option value="tujuan">Filter: Gudang Tujuan</option>
        </select>
      </div>

      {/* Search Bar */}
      <div className="toolbar-goods-search-container">
        <input
          type="text"
          className="toolbar-goods-search-bar"
          placeholder={`Search by ${selectedCategory}`}
          value={inputValue}
          onChange={handleSearchChange}
        />
        <SearchIcon className="toolbar-goods-search-icon" />
      </div>
    </div>
  );
};

export default ToolbarGoodsTransport;
