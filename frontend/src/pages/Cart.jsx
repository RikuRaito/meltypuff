const getUserEmail = () => {
  return localStorage.getItem('isLoggedIn') === 'true'
    ? localStorage.getItem('email')
    : null;
}
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

const Cart = ({isLoggedIn}) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [isOnlyNon, setIsOnlyNon] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');

  const lookupAddress = () => {
    fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode.replace('-', '')}`)
      .then(res => res.json())
      .then(data => {
        if (data.results && data.results[0]) {
          const r = data.results[0];
          setAddress1(r.address1 + r.address2);
          setAddress2(r.address3);
        }
      })
      .catch(err => console.error('郵便番号検索エラー:', err));
  };

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

  useEffect(() => {
    if (isLoggedIn) {
      const email = getUserEmail();
      if (email) {
        fetch('/api/account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        .then(res => res.json())
        .then(data => {
          if(data.status === 'Success'){
            console.log('Got user data')
            setPostalCode(data.address_num)
            setAddress1(data.address_1)
            setAddress2(data.address_2)
            setPhone(data.phone_number)
          }
        })
        .catch(err => {
          console.log('Failed to get user information')
        });
      }
    }
  })

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

  const handlePurchase = () => {
    if(serverTotal < 2000) {
      alert('ミニデバイス(合計2,000円未満の購入はできません')
      return
    }
    const email = getUserEmail();
    const body = {
      items: cart,
      amount: serverTotal,
      postalCode,
      address1,
      address2
    }
    if (email) {
      body.email = email
    }

    fetch('/api/checkout', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error('checkoutUrl not returned', data)
        alert('決済ページの生成に失敗しました')
      }
    })
    .catch(err => {
      console.log('Checkout API error:', err);
      alert('決済処理中にエラーが発生しました')
    });
  }
  

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
      <div className='information-input'>
        <h3>お客様情報</h3>
        <label>
          氏名
          <input type='text' name='customerName' placeholder='お名前を入力'/>
        </label>
        <label>メールアドレス
          <input
            type='email'
            name='email'
            placeholder='メールアドレスを入力'
            value={email}
            onChange={e => {setEmail(e.target.value)}}/>
        </label>
        <label>電話番号
          <input
            type='tel'
            name='phone'
            placeholder='電話番号を入力'
            value={phone}
            onChange={e => setPhone(e.target.value)}/>
        </label>
        <label>
          郵便番号
          <input
            type="text"
            name="postalCode"
            placeholder="1234567"
            value={postalCode}
            onChange={e => setPostalCode(e.target.value)}
            onBlur={lookupAddress}
          />
        </label>
        <label>
          都道府県・市区町村
          <input 
            type="text"
            name="address1"
            value={address1}
            onChange={e => setAddress1(e.target.value)}
            placeholder="例: 東京都千代田区" />
        </label>
        <label>
          詳細住所
          <input 
            type="text"
            name="address2"
            value={address2}
            onChange={e => setAddress2(e.target.value)}
            placeholder="例: 1-1-1" />
        </label>
      </div>
      <footer className="cart-footer">
        
        <div className="total">合計: ¥{serverTotal.toLocaleString()}</div>
        <button
            className="checkout-button"    
            onClick={handlePurchase}
        >支払う</button>
        
      </footer>
    </div>
  );
};

export default Cart;