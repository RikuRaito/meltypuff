import React, { useState } from 'react'
import './DashLogin.css'

const DashLogin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
    const handleSubmit = async(e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin_login', {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify ({
                    "email": email,
                    "password": password
                }),
            });
            if (!res.ok) { 
                const errorData = await res.json()
                console.log('ログインエラー', errorData);
                alert(errorData.message || 'エラーが発生しました')
            } else {
                const data = await res.json()
                console.log('Response:', data.message)
                localStorage.setItem('adminEmail',email)
                window.location.href = '/MeltyPuff_Dashboard'
            }
        } catch(err) {
            console.log('ログインエラー')
        }
    }

    return (
        <div className='dashboard-login'>
            <form className='dashboard-login-container' onSubmit={handleSubmit}>
                <h1 className='dashboard-login-title1'>MeltyPuff</h1>
                <h1 className='dashboard-login-title2'>アドミンログイン画面</h1>
                <div className='input-group'>
                    <label htmlFor='email'>メールアドレス</label>
                    <input
                        className='email-input'
                        type='email'
                        placeholder='メールアドレス'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <label htmlFor='password'>パスワード</label>
                    <input
                        className='password-input'
                        type='passoword'
                        placeholder='パスワード'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button type='submit' className='submit-button'>ログイン</button>
                </div>
            </form>
        </div> 
    )
}

export default DashLogin