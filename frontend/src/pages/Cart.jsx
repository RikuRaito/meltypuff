import React, { useState, useEffect } from 'react';
import './Cart.css';

const productsMap = {
    1: '/images/lm_blueberry.jpg',
    2: '/images/lm_strawberry.jpg',
    3: '/images/lm_mint.jpg',
    4: '/images/lm_mango.jpg',
    5: '/images/lm_grape.jpg',
    6: '/images/lm_melon.jpg',
    11: '/images/PineappleIce.jpg',
    12: '/images/RedEnergy.jpg',
    13: '/images/Spearmint.jpg',
    14: '/images/AloeGrape.jpg',
    15: '/images/SlowBlow.jpg'
}

const Cart = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [isOnlyNon, setIsOnlyNon] = useState(false);

  // 全商品情報を取得
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('商品取得エラー:', err));
  }, []);

  // localStorage からカート情報を読み込む
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(stored);
  }, []);

  // カートが変わるたびに localStorage に同期
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  //calculate amount with calc_amount API as cart is changed
  useEffect(() => {
    if (cart.length === 0) {
      setServerTotal(0);
      return;
    }
    fetch('/api/calc_amount', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({items: cart})
    })
        .then(res => res.json())
        .then(data => {
            console.log('Calculated Amount:', data.amount);
            setServerTotal(data.amount);
            if (data.shipping_fee > 0) {
                setIsOnlyNon(true);
            }
        })
        .catch(err => {
            console.log('Failed to get amount from server',err)
        });
  }, [cart])

  const handleQtyChange = (id, newQty) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, qty: newQty } : item
      )
    );
  };

  const handleRemove = id => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const findProduct = id => products.find(p => p.id === id) || {};

  const subtotal = cart.reduce((sum, item) => {
    const p = findProduct(item.id);
    return sum + (p.price || 0) * item.qty;
  }, 0);

  return (
    <div className="cart-container">
      <h2>ショッピングカート</h2>
      {cart.map((item, index) => {
        const p = findProduct(item.id);
        return (
          <React.Fragment key={item.id}>
            <div className="cart-item">
              {productsMap[item.id] && <img src={productsMap[item.id]} alt={p.name} />}
              <div className="cart-item-details">
                <div className="name">{p.name}</div>
                <div className="price">値段: ¥{(p.price || 0).toLocaleString()}</div>
                <div className="cart-item-actions">
                  <label>数量：</label>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={e => handleQtyChange(item.id, Number(e.target.value))}
                  />
                  <button
                    className="remove-button"
                    onClick={() => handleRemove(item.id)}
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
            {index < cart.length - 1 && <hr />}
          </React.Fragment>
        );
      })}
      {isOnlyNon && (
        <div className='shipping'>ノンニコチンベイプ送料: ¥250</div>
      )}
      <footer className="cart-footer">
        
        <div className="total">合計: ¥{serverTotal.toLocaleString()}</div>
        <button className="checkout-button">支払う</button>
      </footer>
    </div>
  );
};

export default Cart;