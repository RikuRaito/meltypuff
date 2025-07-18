import React, {useState} from 'react'
import './ResetRequest.css'

const ResetRequest = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(false)

    const handleSubmit = async(e) => {
        e.preventDefault();
        try{
            const res = await fetch('/api/reset_request', {
                method:'POST',
                headers: {
                    "Content-Type": 'application/json',
                },
                body: JSON.stringify({
                    email
                }),
            });
            if (!res.ok) {
                    const errorData = await res.json()
                    console.error("リクエスト送信エラー", errorData)
                    alert(errorData.message || 'エラーが発生しました')
                    return;
                }
            const data = await res.json()
            console.log('メールアドレスにパスワードリセットに関する情報をお送りいたしました')
            setStatus(true);
        } catch (err) {
            console.log('リクエスト送信エラー')
        }
    }

    return (
        <div className='reset-wrapper'>
            <form className='reset-container' onSubmit={handleSubmit}>
                <h1 className='resetPassword-title1'>Melty Puff</h1>
                <h1 className='resetPassword-title2'>パスワードリセット</h1>
                <div className='input-group'>
                    <label htmlFor='email'>メールアドレス</label>
                    <input 
                        id='email'
                        type='email'
                        className='email-input'
                        placeholder='メールアドレスを入力'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                
                <button type='submit' className='reset-request'>リセットリクエスト送信</button>
                {status && (
                    <p className="reset-success">メールアドレスに送信しました</p>
                )}
            </form>
        </div>
    )
}

export default ResetRequest