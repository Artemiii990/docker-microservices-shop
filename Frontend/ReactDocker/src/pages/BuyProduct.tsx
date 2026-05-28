import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/BuyProduct.css";
import {API_ORDERS} from "../api/source.ts"

const API_URL = API_ORDERS;

export default function BuyProduct() {

    const location = useLocation();
    const navigate = useNavigate();

    const { title, price, imageUrl } = location.state || {};

    const [quantity, setQuantity] = useState(1);

    const token = localStorage.getItem("token");

    const handleBuy = async () => {

        if (!token) {
            navigate("/login");
            return;
        }

        if (!title || !price) {
            alert("Некоректні дані товару");
            return;
        }

        try {

            const res = await fetch(
                `${API_URL}/api/orders/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        productName: title,
                        quantity: quantity,
                        price: price
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Помилка замовлення");
            }

            const order = await res.json();

            navigate("/approved", {
                state: {
                    order,
                    product: { title, price, imageUrl },
                    quantity
                }
            });

        } catch (err) {
            console.error(err);
            alert("Помилка створення замовлення");
        }
    };

    return (
        <div className="buy-container">

            <div className="buy-card">

                <img
                    src={imageUrl || "/images/placeholder.png"}
                    alt={title || "product"}
                />

                <div className="buy-info">

                    <h2>{title}</h2>

                    <p className="price">{price} грн</p>

                    <div className="quantity">

                        <label>Кількість</label>

                        <input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(Math.max(1, Number(e.target.value)))
                            }
                        />

                    </div>

                    <button
                        className="buy-button"
                        onClick={handleBuy}
                    >
                        Підтвердити покупку
                    </button>

                </div>

            </div>

        </div>
    );
}