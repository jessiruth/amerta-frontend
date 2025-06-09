import "../styles/Toolbar.css";
import addIcon from "../assets/Add.png";
import refreshIcon from "../assets/Refresh.png";
import filterIcon from "../assets/Filter.png";

const Toolbar = ({ onAdd, onRefresh, onFilter, onSearch }) => {
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
                    placeholder="Search here"
                    className="search-bar"
                    onChange={(e) => onSearch(e.target.value)}
                />
                <span className="search-icon">🔍</span>
            </div>
        </div>
    );
};

export default Toolbar;
