import { Link, useNavigate } from "react-router-dom";
import "../styles/Header.css";
import { useState, useEffect } from "react";
import searchIcon from "../icons/search.png";
import KosicIcon from "../icons/basket.svg";
import { FaUserCircle } from "react-icons/fa";

export default function Header() {

    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );

    const [searchText, setSearchText] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

        const updateToken = () => {
            const savedToken = localStorage.getItem("token");
            setToken(savedToken);
        };

        updateToken();

        window.addEventListener("authChanged", updateToken);

        return () => {
            window.removeEventListener("authChanged", updateToken);
        };

    }, []);

    const handleSearch = (e: React.FormEvent) => {

        e.preventDefault();

        if (!searchText.trim()) return;

        navigate(`/searchresult?query=${encodeURIComponent(searchText.trim())}`);
    };

    return (
        <header className="header">

            <div className="header-container">

                <Link to="/backLeftSide">
                    <div className="burger">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </Link>

                <Link to="/" className="logo">
                    <img
                        src="https://yellow.ua/media/logo/default/Black_1.svg"
                        alt="logo"
                    />
                </Link>

            </div>

            <form className="search-form" onSubmit={handleSearch}>

                <input
                    type="text"
                    className="search-input"
                    placeholder="Пошук товарів..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                <button type="submit" className="search-button">
                    <img src={searchIcon} alt="search"/>
                </button>

            </form>

            <div className="header-buttons">

                {token ? (
                    <>
                        {/* Профиль */}
                        <Link to="/profile">
                            <button>
                                <FaUserCircle
                                    size={28}
                                    color="#333"
                                    title="Профіль"
                                />
                            </button>
                        </Link>

                        {/* Корзина */}
                        <Link to="/kosik">
                            <button>
                                <img src={KosicIcon} alt="Кошик"/>
                            </button>
                        </Link>
                    </>
                ) : (
                    <>
                        {/* Логин */}
                        <Link to="/login">
                            <button className="login-button">
                                <img src="user.svg" alt="user"/>
                                Увійти
                            </button>
                        </Link>

                        {/* Корзина */}
                        <Link to="/kosik">
                        <button>
                                <img src={KosicIcon} alt="Кошик"/>
                            </button>
                        </Link>
                    </>
                )}

            </div>

        </header>
    );
}