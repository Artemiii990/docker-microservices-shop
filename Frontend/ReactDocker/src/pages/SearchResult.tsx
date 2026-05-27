import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/SearchResult.css";
import type { Product } from "../Type/TypeProduct.ts";

const API_URL = "http://localhost:5000";

export default function SearchResults() {

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const query = new URLSearchParams(location.search).get("query") ?? "";

    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [search, setSearch] = useState("");
    const [sortType, setSortType] = useState("default");

    useEffect(() => {
        if (!query) return;

        const fetchProducts = async () => {
            setLoading(true);

            try {

                const res = await fetch(
                    `${API_URL}/api/FindProduct?search=${encodeURIComponent(query)}`
                );

                if (!res.ok) {
                    throw new Error("API error");
                }

                const data = await res.json();
                console.log("API DATA:", data);
                setProducts(Array.isArray(data) ? data : []);


            } catch (err) {
                console.error("Fetch error:", err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

    }, [query]);

    // защита от мусора
    const safeProducts = Array.isArray(products) ? products : [];

    // ФИЛЬТР
    const filteredProducts = safeProducts.filter((p) => {

        const name = (p.name ?? "").toLowerCase();
        const price = Number(p.price ?? 0);
        const querySearch = search.toLowerCase();

        if (querySearch && !name.includes(querySearch)) return false;

        if (minPrice && price < Number(minPrice)) return false;
        if (maxPrice && price > Number(maxPrice)) return false;

        return true;
    });

    // СОРТИРОВКА
    const sortedProducts = [...filteredProducts].sort((a, b) => {

        const priceA = Number(a.price ?? 0);
        const priceB = Number(b.price ?? 0);

        if (sortType === "price_asc") return priceA - priceB;
        if (sortType === "price_desc") return priceB - priceA;

        return 0;
    });

    return (
        <div className="search-page">

            <div className="products-section">

                <h2>Результати пошуку: "{query}"</h2>

                {loading ? (
                    <p>Завантаження...</p>
                ) : sortedProducts.length === 0 ? (
                    <p className="no-results">Нічого не знайдено</p>
                ) : (
                    <div className="products-grid">

                        {sortedProducts.map((p) => (

                            <div className="product-card-result" key={p.id}>

                                <img
                                    src={p.imageUrl}
                                    alt={p.name ?? "product"}
                                />

                                <h3>{p.name}</h3>

                                <p className="price">{p.price} грн</p>

                                <Link to="/approved">
                                    <button className="submit-buy-find">
                                        Купити
                                    </button>
                                </Link>

                            </div>

                        ))}

                    </div>
                )}

            </div>

            <div className="filter-panel">

                <h3>Фільтри</h3>

                <div className="filter-block">

                    <label>Пошук за назвою</label>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

                <div className="filter-block">

                    <label>Ціна</label>

                    <input
                        type="number"
                        placeholder="від"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder="до"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />

                </div>

                <div className="filter-block">

                    <label>Сортування</label>

                    <select
                        value={sortType}
                        onChange={(e) => setSortType(e.target.value)}
                    >
                        <option value="default">Без сортування</option>
                        <option value="price_asc">Дешеві → дорогі</option>
                        <option value="price_desc">Дорогі → дешеві</option>
                    </select>

                </div>

            </div>

        </div>
    );
}