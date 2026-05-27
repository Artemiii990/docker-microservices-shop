type CartItem = {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    quantity: number;
};

export function addToCart(
    id: number,
    title: string,
    price: number,
    imageUrl: string,
    token?: string
) {
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
            id,
            name: title,
            price,
            imageUrl,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Товар додано у кошик");
}