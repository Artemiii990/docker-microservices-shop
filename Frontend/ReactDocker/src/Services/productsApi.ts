const API_URL = "http://localhost:5002/api/products";

export const getProducts = async () => {

    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Ошибка загрузки товаров");
    }

    return await response.json();
};


export const addProduct = async (
    product: {
        name: string;
        price: number;
        categorySlug: string;
        image: File;
    },
    token: string
) => {

    const formData = new FormData();

    formData.append("name", product.name);

    formData.append(
        "price",
        product.price.toString()
    );

    formData.append(
        "categorySlug",
        product.categorySlug
    );

    formData.append(
        "image",
        product.image
    );

    const response = await fetch(API_URL, {
        method: "POST",

        headers: {
            Authorization: `Bearer ${token}`
        },

        body: formData
    });

    if (!response.ok) {

        const error = await response.text();

        throw new Error(error);
    }

    return await response.json();
};


// 🔹 Удалить товар
export const deleteProduct = async (id: number) => {

    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("Ошибка удаления товара");
    }
};