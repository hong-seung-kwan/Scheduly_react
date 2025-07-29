import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Context } from '..';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login } from "../store/memberSlice";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const Login = () => {

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const [user, setUser] = useState({});

    const { host } = useContext(Context);

    const handleChange = (e) => {
        const { name, value } = e.target;

        const newMember = { ...user };
        newMember[name] = value;

        setUser(newMember);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${host}/login`, user);
            if (response.status === 200) {
                dispatch(login(response.data));
                navigate('/');
            }
        } catch (error) {
            // 서버에서 보낸 에러 메시지 가져오기
            if (error.response && error.response.data && error.response.data.message) {
                const message = error.response.data.message;

                console.log(error.response.data.message)

                if (message.includes("id")) {
                    alert("아이디가 틀렸습니다.");
                } else if (message.includes("자격증명") || message.includes("Bad credentials")) {
                    alert("비밀번호가 틀렸습니다.");
                } else {
                    alert("로그인 실패: " + message);
                }
            } else {
                alert("서버와 연결할 수 없습니다.");
            }
        }
    };


    const handleGoogleLogin = async (credentialResponse) => {
        const idToken = credentialResponse.credential;

        try {
            const response = await axios.post(`${host}/google`, {

                idToken

            });

            if (response.status === 200) {
                const { token, userNo, userId, userName, role } = response.data;

                axios.defaults.headers.common['Authorization'] = `${token}`;
                dispatch(login({
                    token: token,
                    user: {
                        userNo,
                        userId,
                        userName,
                        role
                    }
                }));
                navigate("/")
            }
        } catch (error) {
            console.log("구글 로그인 실패", error);
        }
    }

    const handleGoogleLoginError = () => {
        alert("구글 로그인 실패");
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <span className="auth-header-text">Scheduly</span>

                    <h1 className="auth-title">로그인</h1>
                </div>

                <form id="loginForm" className="auth-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label htmlFor="username" className="form-label">아이디</label>
                        <div className="input-with-icon">
                            <span className="input-icon">🆔</span>
                            <input type="text" id="username" name="userId" className="form-input" placeholder="아이디를 입력하세요" required onChange={handleChange} />
                        </div>

                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">비밀번호</label>
                        <div className="input-with-icon">
                            <span className="input-icon">🔒</span>
                            <input type="password" id="password" name="password" className="form-input" placeholder="비밀번호를 입력하세요" required onChange={handleChange} />
                        </div>

                    </div>

                    <button type="submit" id="submitBtn" className="auth-submit-btn">
                        로그인
                    </button>
                </form>

                <div className='google-login'>
                    <GoogleOAuthProvider clientId='875926317578-ia85hct28ujlq45hct4an2dugorro69g.apps.googleusercontent.com'>
                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={handleGoogleLoginError}
                            useOneTap

                        />

                    </GoogleOAuthProvider>
                </div>
            </div>
        </div>
    )
}

export default Login