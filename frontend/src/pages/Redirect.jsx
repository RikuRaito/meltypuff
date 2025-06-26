import React, { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import './Redirect.css'

function Redirect() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId') || ''
  const status = searchParams.get('status') || ''
  const navigate = useNavigate()

  const handleHome = () => {
    navigate('/')
  }

  const completeOrder = () => {
    fetch('/api/complete_order',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            order_id: orderId,
            status: status          
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Complete order response:' ,data)
    })
    .cathc(err => {
        console.err('Complete order error:', err)
    })
  }

  useEffect(() => {
    if (orderId && status) {
        completeOrder()
    }
  }, [orderId, status])

  return (
    <div className="redirect-page">
      <div className="redirect-content">
        <h1>ご注文ありがとうございます！</h1>
        <p>
          注文番号：
          <span className="order-id">{orderId}</span>
        </p>
        <p className={`status ${status.toLowerCase()}`}>
          ステータス：{status === 'COMPLETED' ? '完了' : status || '不明'}
        </p>
        <button
          className="redirect-button"
          onClick={handleHome}
        >
          ホームに戻る
        </button>
      </div>
    </div>
  )
}

export default Redirect
