import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import './ResetPassword';

const ResetPassword = () => {
    const {token} = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('')
    const [confirm, setConsfirm] = useState('')

    const handleSubmit = () => {

    }

    return (
        <div className='reset-password-wrapper'>
            <form className='reset-password-container' onSubmit={handleSubmit}>
                <h2>新しいパスワードを入力してください</h2>
                <div className='input-group'>
                    <label htmlFor='password'>新しいパスワード</label>
                    <input
                        type='password'
                        id='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
            </form>
        </div>
    )
}

export default ResetPassword