import "../styles/Products-section.css";
import type { Props } from "../Type/TypeProps.ts";

type CartItem = {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    quantity: number;
};

export default function ProductCard({
                                        id,
                                        title,
                                        price,
                                        imageUrl,
                                        token
                                    }: Props) {

  const addToCart = () => {

        if (!token) {
            alert("Увійдіть у систему");
            return;
        }

        const cart: CartItem[] = JSON.parse(
            localStorage.getItem("cart") || "[]"
        );

        const existing = cart.find(item => item.id === id);

        if (existing) {

            existing.quantity += 1;

        } else {

            cart.push({
                id: id,
                name: title,
                price: price,
                imageUrl: imageUrl,
                quantity: 1
            });

        }

        localStorage.setItem("cart", JSON.stringify(cart));

        alert("Товар додано у кошик");
    };

    return (
        <div className="product-card">

            <div className="product-img">
                <img
                    src={imageUrl || "/images/placeholder.png"}
                    alt={title}
                />
            </div>

            <h3>{title}</h3>

            <p>{price} грн</p>

            <button onClick={addToCart} className="Buy-btn-yellow">
                Купити
            </button>

        </div>
    );
}