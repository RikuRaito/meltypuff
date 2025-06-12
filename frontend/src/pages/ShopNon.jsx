import React, { useState } from 'react'
import './ShopNon.css'

const products = [
    {
        id: 1,
        name: 'Lost Mary - ブルーベリーラズベリ',
        img: '/images/lm_blueberry.jpg',
        price: 2200,
    },
    {
        id:2,
        name: 'Lost Mary - ストロベリーキウイ',
        img: '/images/lm_strawberry.jpg',
        price: 2200
    },
    {
        id:3,
        name: 'Lost Mary - ミント',
        img: '/images/lm_mint.jpg',
        price: 2200
    },
    {
        id: 4,
        name: 'Lost Mary - マンゴー',
        img: '/images/lm_mango.jpg',
        price: 2200
    },
    {
        id: 5,
        name: 'Lost Mary - グレープ',
        img: '/images/lm_grape.jpg',
        price: 2200
    },
    {
        id: 6,
        name: 'Lost Mary - メロン',
        img: '/images/lm_melon.jpg',
        price: 2200
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
        console.log(`商品ID: ${productId}を${qty}個をカートに追加しました`)
        //put function to handle
    }

    return (
        <div className="shopnon-container">
            <h1 className='shopnon-title'>商品一覧</h1>
            <h2 className='shopnon-subtitle'>ノンニコチン</h2>
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
                            onClick={() => handleAddToCart(product.id)}
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