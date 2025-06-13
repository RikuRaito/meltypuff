import React, { useState } from 'react'
import './ShopNic.css'

const products = [
    {
        id: 11,
        name: 'Nasty 8.5K - パイナップルアイス',
        img: '/images/PineappleIce.jpg',
        price: 3980,
    },
    {
        id:12,
        name: 'Naty 8.5K - レッドエナジー',
        img: '/images/RedEnergy.jpg',
        price: 3980
    },
    {
        id:13,
        name: 'Naty 8.5K - ミント',
        img: '/images/Spearmint.jpg',
        price: 3980
    },
    {
        id: 14,
        name: 'Naty 8.5K - アロエグレープ',
        img: '/images/AloeGrape.jpg',
        price: 3980
    },
    {
        id: 15,
        name: 'Naty 8.5K - スロウブロウ',
        img: '/images/SlowBlow.jpg',
        price: 3980
    }
]

const ShopNon = () => {

    const [quantities, setQuantities] = useState(
        products.reduce((acc, product) => {
            acc[product.id] = 1
            return acc
        }, {})
    )

    //handler for changing quantites
    const handleQuantityChange = (productId, value) => {
        const newQty = parseInt(value, 10)

        if (isNaN(newQty) || newQty < 1) return
        setQuantities((prev) => ({
            ...prev,
            [productId]: newQty,
        }))
    }

    //dammy handler when add to cart button is pushed
    const handleAddToCart = (productId) => {
        const qty = quantities[productId]
        const isLoggedIn = localStorage.getItem('isLoggedIn' === 'true');

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === productId);
        console.log(`${productId}をカートに追加しました`)
        if (existingItem) {
            existingItem.qty += qty;
        } else {
            cart.push({ id: productId, qty});
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    return (
        <div className="shopnic-container">
            <h1 className='shopnic-title'>商品一覧</h1>
            <h2 className='shopnic-subtitle'>ニコチン</h2>
            <div className='product-grid'>
                {products.map((product) => (
                    <div className="product-card" key={product.id}>
                        <div className="product-image-wrap">
                        <img
                            src={product.img}
                            alt={product.name}
                            className="product-image"
                        />
                        </div>
                        <div className="product-info">
                        <div className="product-name">{product.name}</div>
                        <div className="product-price">¥{product.price.toLocaleString()}</div>
                        </div>
                        <div className="product-purchase">
                        <input
                            type="number"
                            className="product-quantity"
                            min="1"
                            value={quantities[product.id]}
                            onChange={(e) =>
                            handleQuantityChange(product.id, e.target.value)
                            }
                        />
                        <button
                            className="add-to-cart-btn"
                            onClick={() => handleAddToCart(productId)}
                        >
                            カートに追加
                        </button>
                        </div>
                    </div>
                    ))}
            </div>
        </div>
    )
}

export default ShopNon