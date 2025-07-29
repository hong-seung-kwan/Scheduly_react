import axios from 'axios';
import React, { useContext, useState } from 'react'
import { Context } from '../index';
import { useNavigate } from 'react-router-dom';
import "../css/register.css"


// 아이디 비밀번호 유저이름
const Register = () => {

    const { host } = useContext(Context);
    const [member, setMember] = useState([]);
    const [idCheckMessage, setIdCheckMessage] = useState("");
    const [isIdAvailable, setIsIdAvailable] = useState(null);

    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;

        const newMember = { ...member };

        newMember[name] = value;

        setMember(newMember);
    }

    const handleIdCheck = async () => {
        console.log(member.userId);
        console.log("isIdAvailable:", isIdAvailable);
        if (!member.userId) {
            setIdCheckMessage("아이디를 입력하세요");
            setIsIdAvailable(false);
            return;
        }
        try {
            const response = await axios.get(`${host}/checkId?userId=${member.userId}`, {

            });
            if (response.data.available) {
                setIsIdAvailable(true);
                setIdCheckMessage("사용 가능한 아이디입니다.");
            } else {
                setIsIdAvailable(false);
                setIdCheckMessage("아이디가 중복되었습니다.");
            }
        } catch (error) {
            setIsIdAvailable(false);
            setIdCheckMessage("서버 오류가 발생했습니다.");
        }
    }


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${host}/register`, member);

            if (response.status === 201) {
                navigate("/");
            }
        } catch (error) {
            if (error.response && error.response.status === 409) {
                alert(error.response.data.message); // "이미 존재하는 아이디입니다."
            } else {
                alert("회원가입 중 오류가 발생했습니다.");
            }
        }
    };



    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <span className="auth-header-text">Scheduly</span>

                    <h1 className="auth-title">회원가입</h1>
                </div>




                <form id="signupForm" className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">이름</label>
                        <div className="input-with-icon">
                            <span className="input-icon">👤</span>
                            <input type="text" id="name" name="userName" className="form-input" placeholder="이름을 입력하세요" required onChange={handleChange} />
                        </div>

                    </div>

                    <div className="form-group">
                        <label htmlFor="username" className="form-label">아이디</label>
                        <div className="input-with-icon">
                            <span className="input-icon">🆔</span>
                            <input
                                type="text"
                                id="username"
                                name="userId"
                                className="form-input"
                                placeholder="아이디를 입력하세요"
                                required
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">비밀번호</label>
                        <div className="input-with-icon">
                            <span className="input-icon">🔒</span>
                            <input type="password" id="password" name="password" className="form-input" placeholder="비밀번호를 입력하세요" required onChange={handleChange} />
                        </div>
                        <span className="form-error" id="passwordError"></span>
                    </div>

                    <button type="submit" id="submitBtn" className="auth-submit-btn">
                        회원가입
                    </button>
                </form>

                <div className="auth-footer">
                    이미 계정이 있으신가요? <a href="/login">로그인하기</a>
                </div>
            </div>
        </div>

    )
}

export default Register