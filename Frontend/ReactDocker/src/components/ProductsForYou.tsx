import ProductCard from "./ProductCard"
import "../styles/ProductsForYou.css"

type Product = {
    id: number
    name: string
    price: number
    imageUrl: string
}

type Props = {
    products: Product[]
    token: string | null
}

export default function ProductGrid({ products, token}: Props) {
    return (
        <div className="ProductGrid">
            {products.map((p) => (
                <ProductCard
                    key={p.id}
                    id={p.id}
                    title={p.name}
                    price={p.price}
                    imageUrl={p.imageUrl}
                    token={token}
                />
            ))}
        </div>
    )
}