import "../styles/Toolbar.css";
import { useNavigate } from "react-router-dom";
import addIcon from "../assets/Add.png";
import refreshIcon from "../assets/Refresh.png";
import filterIcon from "../assets/Filter.png";
import SearchIcon from "@mui/icons-material/Search";


const Toolbar = ({ onAdd, onRefresh, onFilter, onSearch, searchPlaceholder  }) => {
    return (
        <div className="toolbar">
            {/* Add Button */}
            <div className="toolbar-item">
                <button className="toolbar-btn add-btn" onClick={onAdd}>
                    <img src={addIcon} alt="Add" />
                </button>
                <p className="toolbar-text">Add</p>
            </div>

            {/* Refresh Button */}
            <div className="toolbar-item">
                <button className="toolbar-btn white-btn" onClick={onRefresh}>
                    <img src={refreshIcon} alt="Refresh" />
                </button>
                <p className="toolbar-text">Refresh</p>
            </div>

            {/* Filter Button */}
            <div className="toolbar-item">
                <button className="toolbar-btn white-btn" onClick={onFilter}>
                    <img src={filterIcon} alt="Filter" />
                </button>
                <p className="toolbar-text">Filter</p>
            </div>

            {/* Search Bar */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder={searchPlaceholder || "Search by name..."}
                    className="search-bar"
                    onChange={(e) => onSearch(e.target.value)}
                />
                <SearchIcon className="search-icon" />
            </div>

        </div>
    );
};

export default Toolbar;
