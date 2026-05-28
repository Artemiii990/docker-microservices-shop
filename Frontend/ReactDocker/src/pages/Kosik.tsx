import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Kosik.css";
import {API_ORDERS} from "../api/source.ts"

const API_URL = API_ORDERS;

type CartItem = {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    quantity: number;
};

export default function Cart() {

    const [cart, setCart] = useState<CartItem[]>([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const storedCart = localStorage.getItem("cart");

        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    }, []);

    const updateCart = (items: CartItem[]) => {
        setCart(items);
        localStorage.setItem("cart", JSON.stringify(items));
    };

    const removeItem = (id: number) => {
        const updated = cart.filter(item => item.id !== id);
        updateCart(updated);
    };

    const changeQuantity = (id: number, quantity: number) => {
        if (quantity < 1) return;

        const updated = cart.map(item =>
            item.id === id ? { ...item, quantity } : item
        );

        updateCart(updated);
    };

    const checkout = async () => {

        if (!token) {
            navigate("/login");
            return;
        }

        try {

            for (const item of cart) {

                const res = await fetch(
                    `${API_URL}/api/orders/create`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            productName: item.name,
                            quantity: item.quantity,
                            price: item.price
                        })
                    }
                );

                // 🔥 читаем ответ даже при ошибке
                const text = await res.text();

                if (!res.ok) {
                    throw new Error(text || "Помилка при оформленні замовлення");
                }
            }

            localStorage.removeItem("cart");
            setCart([]);

            alert("Замовлення оформлено");

            navigate("/my-orders");

        } catch (error) {
            console.error(error);
            alert("Помилка при оформленні замовлення");
        }
    };

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className="cart-page">

            <h2>Кошик</h2>

            {cart.length === 0 ? (

                <p>Кошик порожній</p>

            ) : (

                <>

                    <table>

                        <thead>
                        <tr>
                            <th>Товар</th>
                            <th>Ціна</th>
                            <th>Кількість</th>
                            <th></th>
                        </tr>
                        </thead>

                        <tbody>

                        {cart.map(item => (

                            <tr key={item.id}>

                                <td>
                                    <img src={item.imageUrl} width="50" />
                                    {item.name}
                                </td>

                                <td>{item.price} грн</td>

                                <td>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        min={1}
                                        onChange={(e) =>
                                            changeQuantity(
                                                item.id,
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </td>

                                <td>
                                    <button onClick={() => removeItem(item.id)}>
                                        Видалити
                                    </button>
                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                    <h3>Разом: {total} грн</h3>

                    <button onClick={checkout} className="submit">
                        Оформити замовлення
                    </button>

                </>

            )}

        </div>
    );
}