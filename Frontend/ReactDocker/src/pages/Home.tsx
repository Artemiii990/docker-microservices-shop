import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getProducts } from "../Services/productsApi";
import ProductsForYou from "../components/ProductsForYou";
import type { Product } from "../Type/TypeProduct.ts";

type Props = {
    token: string | null;
};

export default function Home({ token }: Props) {

    const [products, setProducts] =
        useState<Product[]>([]);

    const [query, setQuery] =
        useState("");

    const [filters, setFilters] = useState({
        search: "",
        minPrice: "",
        maxPrice: "",
        sortType: "default"
    });

    // =====================================
    // LOAD PRODUCTS
    // =====================================

    useEffect(() => {

        loadProducts();

    }, []);

    const loadProducts = async () => {

        try {

            const data = await getProducts();

            setProducts(data);

        } catch (error) {

            console.error(error);
        }
    };

    // =====================================
    // ELASTICSEARCH SEARCH
    // =====================================

    const searchProducts = async () => {

        try {

            // EMPTY QUERY
            if (!query.trim()) {

                loadProducts();

                return;
            }

            const response = await fetch(
                `/api/products/search?query=${query}`
            );

            if (!response.ok) {

                throw new Error(
                    "Ошибка поиска"
                );
            }

            const data = await response.json();

            setProducts(data);

        } catch (error) {

            console.error(error);
        }
    };

    // =====================================
    // FILTERS
    // =====================================

    const filtered = products.filter(p => {

        const name =
            p.name.toLowerCase();

        const price =
            p.price;

        if (
            filters.search &&
            !name.includes(
                filters.search.toLowerCase()
            )
        )
            return false;

        if (
            filters.minPrice &&
            price < Number(filters.minPrice)
        )
            return false;

        if (
            filters.maxPrice &&
            price > Number(filters.maxPrice)
        )
            return false;

        return true;
    });

    // =====================================
    // SORT
    // =====================================

    const sorted = [...filtered].sort(
        (a, b) => {

            if (
                filters.sortType ===
                "price_asc"
            )
                return a.price - b.price;

            if (
                filters.sortType ===
                "price_desc"
            )
                return b.price - a.price;

            return 0;
        }
    );

    // =====================================
    // UI
    // =====================================

    return (

        <div className="layout">

            <Sidebar
                onFilterChange={setFilters}
            />

            <div className="content">

                {/* SEARCH BAR */}

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "20px"
                    }}
                >

                    <input
                        type="text"
                        placeholder="Search products..."
                        value={query}
                        onChange={(e) =>
                            setQuery(
                                e.target.value
                            )
                        }

                        style={{
                            padding: "10px",
                            width: "300px"
                        }}
                    />

                    <button
                        onClick={searchProducts}
                    >
                        Search
                    </button>

                </div>

                {/* PRODUCTS */}

                <ProductsForYou
                    products={sorted}
                    token={token}
                />

            </div>

        </div>
    );
}