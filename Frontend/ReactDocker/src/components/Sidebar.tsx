import "../styles/Sidebar.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type Props = {
    onFilterChange?: (filters: {
        search: string;
        minPrice: string;
        maxPrice: string;
        sortType: string;
    }) => void;
};

export default function Sidebar({ onFilterChange }: Props) {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortType, setSortType] = useState("default");

    const categories = [
        { name: "Iphone", slug: "Iphone" },
        { name: "IPad", slug: "IPad" },
        { name: "MacBook", slug: "MacBook" },
        { name: "Mac", slug: "Mac" },
        { name: "Watch", slug: "Watch" },
        { name: "Vision Pro", slug: "Vision Pro" },
        { name: "Mac Accsesories", slug: "Mac Accsesories" },
        { name: "Cases & Protection", slug: "Cases & Protection" },
    ];

    const handleClick = (slug: string) => {
        navigate(`/category/${slug}`);
    };

    const updateFilters = (
        newFilters: Partial<{
            search: string;
            minPrice: string;
            maxPrice: string;
            sortType: string;
        }>
    ) => {

        if (!onFilterChange) return;

        onFilterChange({
            search,
            minPrice,
            maxPrice,
            sortType,
            ...newFilters
        });
    };

    return (
        <div className="sidebar">

            <div className="filter-panel-home">

                <h3>Фільтри</h3>

                <div className="filter-block-home">
                    <label>Пошук</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSearch(val);
                            updateFilters({ search: val });
                        }}
                    />
                </div>

                <div className="filter-block-home">
                    <label>Ціна</label>

                    <input
                        type="number"
                        placeholder="від"
                        value={minPrice}
                        onChange={(e) => {
                            const val = e.target.value;
                            setMinPrice(val);
                            updateFilters({ minPrice: val });
                        }}
                    />

                    <input
                        type="number"
                        placeholder="до"
                        value={maxPrice}
                        onChange={(e) => {
                            const val = e.target.value;
                            setMaxPrice(val);
                            updateFilters({ maxPrice: val });
                        }}
                    />
                </div>

                <div className="filter-block">
                    <label>Сортування</label>

                    <select
                        value={sortType}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSortType(val);
                            updateFilters({ sortType: val });
                        }}
                    >
                        <option value="default">Без сортування</option>
                        <option value="price_asc">Дешеві → дорогі</option>
                        <option value="price_desc">Дорогі → дешеві</option>
                    </select>
                </div>

            </div>

            <ul className="ul-list">
                <h2>Категорія</h2>
                {categories.map((cat, index) => (
                    <li
                        key={index}
                        className="li-list"
                        onClick={() => handleClick(cat.slug)}
                    >
                        {cat.name}
                    </li>
                ))}
            </ul>

        </div>
    );
}