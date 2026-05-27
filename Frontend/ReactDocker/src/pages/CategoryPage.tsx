import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/CategoryPage.css";
import { addToCart } from "../Services/addToCart.ts";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:5000";

type Product = {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    category: string;
};

export default function CategoryPage() {

    const { slug } = useParams();

    const [products, setProducts] = useState<Product[]>([]);

    const [filters, setFilters] = useState({
        search: "",
        minPrice: "",
        maxPrice: "",
        sortType: "default"
    });

    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    const token = localStorage.getItem("token") || undefined;

    useEffect(() => {
        if (!slug) return;

        fetch(`${API_URL}/api/FindProduct/category/${slug}`)
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error("Ошибка загрузки:", err));
    }, [slug]);

    // ФИЛЬТР
    const filtered = products.filter(p => {

        const name = p.name.toLowerCase();
        const price = p.price;

        if (filters.search && !name.includes(filters.search.toLowerCase()))
            return false;

        if (filters.minPrice && price < Number(filters.minPrice))
            return false;

        if (filters.maxPrice && price > Number(filters.maxPrice))
            return false;

        return true;
    });

    // СОРТИРОВКА
    const sorted = [...filtered].sort((a, b) => {

        if (filters.sortType === "price_asc")
            return a.price - b.price;

        if (filters.sortType === "price_desc")
            return b.price - a.price;

        return 0;
    });

    // ПАГИНАЦИЯ
    const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));

    const startIndex = (page - 1) * itemsPerPage;

    const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="catalog-layout">

            <Sidebar onFilterChange={setFilters} />

            <div className="catalog-content">

                <h2>{slug}</h2>

                <div className="product-grid-category">

                    {paginated.map(p => (
                        <div key={p.id} className="product-card-category">

                            <img src={p.imageUrl} alt={p.name} />

                            <h3>{p.name}</h3>

                            <p>{p.price} грн</p>

                            <button
                                className="submit"
                                onClick={() =>
                                    addToCart(
                                        p.id,
                                        p.name,
                                        p.price,
                                        p.imageUrl,
                                        token
                                    )
                                }
                            >
                                Додати у кошик
                            </button>

                        </div>
                    ))}

                </div>

                <div className="pagination">

                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        ←
                    </button>

                    <span>{page} / {totalPages}</span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        →
                    </button>

                </div>

            </div>

        </div>
    );
}