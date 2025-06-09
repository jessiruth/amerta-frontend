import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import Toolbar from "../ToolbarGoods";
import "../../styles/GoodsAndServices.css";

const GoodsAndServices = () => {
  const [allBarangList, setAllBarangList] = useState([]);
  const [displayBarangList, setDisplayBarangList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setErrorMessage("");
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Unauthorized: Anda harus login terlebih dahulu.");
      return;
    }

    try {
      const response = await axiosInstance.get("/api/barang/viewall", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data || [];
      if (data.length > 0) {
        setAllBarangList(data);
        setDisplayBarangList(data);
      } else {
        setAllBarangList([]);
        setDisplayBarangList([]);
        setErrorMessage("Tidak ada barang yang tersedia.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Terjadi kesalahan saat mengambil data barang.");
    }
  };

 useEffect(() => {
    if (!searchTerm) {
      setDisplayBarangList(allBarangList);
      return;
    }

    const lower = searchTerm.toLowerCase().trim();
    const parsed = parseFloat(lower.replace(",", "."));

    const filtered = allBarangList.filter((barang) => {
      if (searchCategory === "nama") {
        return barang.nama.toLowerCase() === lower;
      }
      if (searchCategory === "kategori") {
        return barang.kategori.toLowerCase() === lower;
      }
      if (searchCategory === "merk") {
        return barang.merk.toLowerCase() === lower;
      }
      if (searchCategory === "id") {
        return barang.id.toLowerCase() === lower;
      }
      if (searchCategory === "harga jual") {
        return !isNaN(parsed) && parseFloat(barang.hargaJual) === parsed;
      }
      if (searchCategory === "harga beli") {
        return !isNaN(parsed) && parseFloat(barang.hargaBeli) === parsed;
      }
      if (searchCategory === "stok") {
        return barang.totalStock === parseInt(lower, 10);
      }
      if (searchCategory === "status") {
        return (
          (lower === "aktif" && barang.active === true) ||
          (lower === "tidak aktif" && barang.active === false)
        );
      }
      if (searchCategory === "all") {
        return (
          barang.nama.toLowerCase().includes(lower) ||
          barang.kategori.toLowerCase().includes(lower) ||
          barang.merk.toLowerCase().includes(lower) ||
          barang.hargaJual?.toString().replace(".", ",").includes(searchTerm) ||
          barang.hargaBeli?.toString().replace(".", ",").includes(searchTerm) ||
          barang.id.toLowerCase().includes(lower)
        );
      }
      return false;
    });

    setDisplayBarangList(filtered);
    setCurrentPage(1);
  }, [searchTerm, searchCategory, allBarangList]);


  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilterChange = (category) => {
    setSearchCategory(category);
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setSearchCategory("all");
    setCurrentPage(1);
    fetchData();
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayBarangList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayBarangList.length / itemsPerPage);

  return (
    <div className="goods-list-container">
      <div className="goods-list-content">
        <h1 className="goods-page-title">Goods & Services</h1>

        <Toolbar
          onAdd={() => navigate("/goods-and-services/add")}
          onRefresh={handleRefresh}
          onFilter={handleFilterChange}
          onSearch={handleSearch}
          selectedCategory={searchCategory}
          searchTerm={searchTerm}
        />

        <div className="goods-pagination-controls">
          <label>Items per page:</label>
          <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>

        <div className="goods-table-container">
          <div className="goods-table-header">
            <h2>Barang</h2>
          </div>

          <table className="goods-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Merk</th>
                <th>Stok</th>
                <th>Harga Beli</th>
                <th>Harga Jual</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((barang) => (
                  <tr key={barang.id}>
                    <td>{barang.id}</td>
                    <td>{barang.nama}</td>
                    <td>{barang.kategori}</td>
                    <td>{barang.merk}</td>
                    <td>{barang.totalStock}</td>
                    <td>Rp{parseFloat(barang.hargaBeli).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                    <td>Rp{parseFloat(barang.hargaJual).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                    <td>{barang.active ? "Aktif" : "Tidak Aktif"}</td>
                    <td>
                      <button
                        className="goods-detail-btn"
                        onClick={() => navigate(`/goods-and-services/${barang.id}`)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="goods-no-data-text">
                    {errorMessage || "Barang tidak ditemukan."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="goods-pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>First</button>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
          <span>Page {totalPages === 0 ? 0 : currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(totalPages)}>Last</button>
        </div>
      </div>
    </div>
  );
};

export default GoodsAndServices;
