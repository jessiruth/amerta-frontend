import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Toolbar from '../Toolbar';
import axiosInstance from '../../services/axiosInstance';
import '../../styles/GudangList.css';

const GudangList = () => {
    const [loading, setLoading] = useState(true);
    const [gudangList, setGudangList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState({ kota: '', provinsi: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        fetchGudangList(token);
    }, [navigate]);

    const fetchGudangList = async (token) => {
        setLoading(true);
        const { kota, provinsi } = locationFilter;
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (kota) params.append('kota', kota);
            if (provinsi) params.append('provinsi', provinsi);

            const endpoint = `/api/gudang/?${params.toString()}`;
            const response = await axiosInstance.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (response.data && response.data.data) {
                setGudangList(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching gudang list:', error);
            if (error.response && error.response.status === 403) {
                alert('Anda tidak memiliki akses untuk melihat daftar gudang');
                navigate('/dashboard');
            } else {
                alert('Gagal memuat daftar gudang');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddGudang = () => {
        navigate('/gudang/add');
    };

    const handleRefresh = () => {
        setSearchTerm('');
        setLocationFilter({ kota: '', provinsi: '' });
        const token = localStorage.getItem("token");
        if (token) {
            fetchGudangList(token);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = () => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchGudangList(token);
        }
    };

    const handleLocationFilterChange = (e) => {
        const { name, value } = e.target;
        setLocationFilter(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilter = () => {
        // You can implement a modal/popup for the filter functionality
        // For now, we'll just use the existing filter
        const token = localStorage.getItem("token");
        if (token) {
            fetchGudangList(token);
        }
    };

    const handleViewDetail = (namaGudang) => {
        navigate(`/gudang/${namaGudang}`);
    };

    if (loading && gudangList.length === 0) {
        return (
            <div className="gudang-list-container">
                <Navbar />
                <div className="gudang-list-content">
                    <h3 className="loading-text">Memuat data gudang...</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="gudang-list-container">
            <Navbar />
            <div className="gudang-list-content">
                <h1 className="page-title">Storage</h1>

                <Toolbar
                    onAdd={handleAddGudang}
                    onRefresh={handleRefresh}
                    onFilter={handleFilter}
                    onSearch={handleSearch}
                    searchTerm={searchTerm}
                    onSearchSubmit={handleSearchSubmit}
                />

                <div className="table-container">
                    <div className="table-header">
                        <h2>Storage Table</h2>
                    </div>
                    
                    {loading ? (
                        <div className="loading-container">
                            <p>Loading...</p>
                        </div>
                    ) : (
                        <table className="gudang-table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Lokasi</th>
                                    <th>Kapasitas</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gudangList.length > 0 ? (
                                    gudangList.map((gudang) => (
                                        <tr key={gudang.nama}>
                                            <td>{gudang.nama}</td>
                                            <td>{`${gudang.alamatGudang?.kota || '-'}, ${gudang.alamatGudang?.provinsi || '-'}`}</td>
                                            <td>{gudang.kapasitas}</td>
                                            <td>
                                                <button 
                                                    className="detail-btn"
                                                    onClick={() => handleViewDetail(gudang.nama)}
                                                >
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="no-data">
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GudangList;