import React, { useState } from 'react'
import './Support.css'

const faqData = [
  {
    category: '商品に関するご質問',
    items: [
      {
        question: 'Q. ベイプの使い方を教えて下さい',
        answer:
          '吸引口についているキャップを外していただきましたら、すぐに吸引可能でございます。'
      },
      {
        question: 'Q. 初心者におすすめの製品はどれですか？',
        answer:
          '普段たばこを吸われない方にはノンニコチンベイプをおすすめしております．\n一方普段から加熱式たばこを使用されている方は吸い心地の満足度の高いニコチンベイプをおすすめしております'
      },
      {
        question: 'Q. フレーバーの種類はどれくらいありますか？',
        answer:
          '現在Melty Puffではノンニコチンベイプは6種、ニコチンベイプは5種の販売をしております。'
      }
    ]
  },
  {
    category: 'ご購入・配送に関するご質問',
    items: [
      {
        question: 'Q. 注文後どれくらいで届きますか？',
        answer:
          'ノンニコチンベイブは国内からの発送となりますので1～2日でお届け先にご到着いたします。\nまた、ニコチンペイプは海外の連携倉庫からの発送となりますのでご注文から1週間後にお届け先にご到着いたします。'
      },
      {
        question: 'Q. 送料はいくらですか？',
        answer:
          'ノンニコチンベイブはご注文ごとに250円、ニコチンペイブは送料無料でご案内させていただいております。'
      }
    ]
  },
  {
    category: 'トラブルシューティングに関するご質問',
    items: [
      {
        question: 'Q. ベイプが動かない時の対処法は？',
        answer:
          'お問い合わせフォームからご相談ください。修理方法やご返金について個別に担当者からメールを送させていただきます。'
      },
      {
        question: 'Q. リキッドの詰め替え方を教えてください',
        answer:
          '当社で販売している製品は、現在すべて使い捨てタイプとなっております。ご使用後はお客様ご自身で、適切な方法で廃棄していただきますようお願い申し上げます。'
      }
    ]
  },
  {
    category: '法律や年齢制限に関するご質問',
    items: [
      {
        question: 'Q. 購入には年齢制限がありますか？',
        answer:
          'ご購入の際にはお客様が20歳以上か年齢確認をさせていただきます。'
      },
      {
        question: 'Q. ニコチンベイプが税関で没収されてしまった場合はどうすればいいですか？',
        answer:
          'ご購入いただいたベイプが関税で没収されることのないよう、当社ではお客様のリキッドのご注文量を適切に管理しております。どうぞ安心してご利用ください。'
      }
    ]
  }
]

const Support = () => {
  // openIndex: { "カテゴリインデックス-質問インデックス": true/false }
  const [openIndex, setOpenIndex] = useState({});
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const toggleItem = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`
    setOpenIndex(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }
  
  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
        //put function of accessing api endpoint to submit
        const response = await fetch ('/api/contact', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, message})
        });
        if (response.ok){
            alert('お問い合わせ内容を送信しました．ありがとうございます．');
            setEmail('')
            setMessage('')
        } else {
            alert('エラーが発生しました．もう一度お試し下さい');
        }
    } catch (error){
        console.log(error);
        alert('エラーが発生しました')
    }
  }

  return (
    <div className="support-container">
      {/* ページタイトル */}
      <h1 className="support-title">お問い合わせ</h1>
      {/* FAQ 全体見出し */}
      <h2 className="faq-overview">よくあるご質問</h2>

      {/* カテゴリごとにループ */}
      {faqData.map((catData, catIdx) => (
        <div className="faq-category" key={catIdx}>
          {/* カテゴリ見出し */}
          <h3 className="faq-category-title">{catData.category}</h3>

          {/* そのカテゴリ内の質問リスト */}
          <div className="faq-list">
            {catData.items.map((item, itemIdx) => {
              const key = `${catIdx}-${itemIdx}`
              const isOpen = !!openIndex[key]

              return (
                <div
                  className={`faq-item ${isOpen ? 'open' : ''}`}
                  key={itemIdx}
                >
                  {/* 質問ボタン（クリックで開閉） */}
                  <button
                    className="faq-question"
                    onClick={() => toggleItem(catIdx, itemIdx)}
                  >
                    <span>{item.question}</span>
                    <span className="icon">{isOpen ? '−' : '+'}</span>
                  </button>

                  {/* 回答部分（isOpen が true なら表示） */}
                  <div className="faq-answer">
                    {/* 「\n」で改行させたい部分は CSS で white-space を制御 */}
                    {item.answer}
                  </div>
                </div>
              )
             })}
          </div>
        </div>
      ))}
      <h3 className="contact-form-title">お問い合わせフォーム</h3>
      <form className='contact-form' onSubmit={handleSubmit}>
        <label htmlFor="email">
            <strong>メールアドレス</strong>
        </label>
        <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />
        <label htmlFor='message'>
            <strong>お問い合わせ内容</strong>
        </label>
        <textarea
            id='message'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
        />
        <button type='submit'>送信</button>
      </form>
    </div>
  )
}

export default Support