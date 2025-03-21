import React from 'react';
import "../styles/Toolbar.css";
import addIcon from "../assets/Add.png";
import refreshIcon from "../assets/Refresh.png";
import filterIcon from "../assets/Filter.png";

const Toolbar = ({ onAdd, onRefresh, onFilter, onSearch, searchTerm, onSearchSubmit }) => {
    return (
        <div className="toolbar-wrapper">
            <div className="toolbar">
                <div className="action-buttons">
                    <button className="add-button" onClick={onAdd}>
                        <img src={addIcon} alt="Add" className="toolbar-icon" />
                        <span className="button-text">Add</span>
                    </button>
                    
                    <button className="refresh-button" onClick={onRefresh}>
                        <img src={refreshIcon} alt="Refresh" className="toolbar-icon" />
                        <span className="button-text">Refresh</span>
                    </button>
                    
                    <button className="filter-button" onClick={onFilter}>
                        <img src={filterIcon} alt="Filter" className="toolbar-icon" />
                        <span className="button-text">Filter</span>
                        <span className="dropdown-arrow">▼</span>
                    </button>
                </div>
            </div>
            
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search here"
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => onSearch(e)}
                />
                <button className="search-button" onClick={onSearchSubmit}>
                    <span className="search-icon">🔍</span>
                </button>
            </div>
        </div>
    );
};

export default Toolbar;