import { Calendar, CardSim, CheckSquare, Home, LogIn, LogOut, Plus, UserPen } from 'lucide-react'
import React, { useState } from 'react'
import "../css/Sidebar.css";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/memberSlice';
import { clearEvents } from '../store/eventSlice';
import { Modal } from "../features/ApiModal";



const Sidebar = ({onSaveSuccess}) => {

    const [openModal, setOpenModal] = useState(false);
    const [reload, setReload] = useState(false);

    const user = useSelector((state) => state.member.info);
    const token = useSelector((state) => state.member.token);
    const isLogIn = !!user;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {

        dispatch(logout());

        dispatch(clearEvents());

        navigate("/");

    }

    const navigation = [
        { name: "홈 화면", href: "/", icon: Home },
        !isLogIn && { name: "회원가입", href: "/register", icon: UserPen },
        isLogIn
            ? { name: "로그아웃", href: "/", icon: LogOut }
            : { name: "로그인", href: "/login", icon: LogIn },

        { name: "게시판", href: "/board/main", icon: CardSim },
        { name: "수동 일정 추가", href: "/plan/register", icon: Plus },
        { name: "자동 일정 추가", href: "#", icon: Plus }

    ].filter(Boolean);

    const handleApiAccess = async () => {
        if (!user) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        if (user.role === "free") {
            const goPay = window.confirm("이 기능은 결제가 필요합니다. 결제 페이지로 이동할까요?\n결제금액: 1000원");
            if (goPay) {
                // 결제 준비 요청 보내고 리디렉션
                try {
                    const response = await fetch("http://localhost:8080/kakao/ready", {
                        method: "POST",
                        headers: {
                            Authorization: token,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            userNo: user.userNo
                        })
                    });
                    const data = await response.json();
                    console.log("kakao ready response", data);
                    console.log("token:", token);

                    if (!data.next_redirect_pc_url) {
                        alert("결제 페이지 URL을 받아오지 못했습니다");
                        return;
                    }

                    localStorage.setItem("kakao_tid", data.tid);
                    localStorage.setItem("userNo", user.userNo); // 승인용 정보 저장

                    window.location.href = data.next_redirect_pc_url;
                } catch (error) {
                    console.error("결제 준비 실패", error);
                    alert("결제 준비 중 오류가 발생했습니다.");
                }
            }
        } else {
            setOpenModal(true); // 유료 사용자만 모달 열기

        }
    };



    return (
        <div className='sidebar'>
            <div className='header'>
                <div className='logo'>
                    <div className='logoIcon'>
                        <CheckSquare size={20} />
                    </div>
                    <h2 className='logoText'>Scheduly</h2>
                </div>
            </div>

            <nav className='nav'>
                <ul className='navList'>
                    {navigation.map((item) =>
                        item.name === "로그아웃" ? (
                            <button key={item.name} onClick={handleLogout} className='navButton'>
                                <item.icon className='navIcon' />
                                {item.name}
                            </button>
                        ) : item.name === "자동 일정 추가" || "게시판" ? (
                            <li key={item.name} className='navItem'>
                                <button className='navButton' onClick={handleApiAccess}>
                                    <item.icon className='navIcon' />
                                    {item.name}
                                </button>
                            </li>
                        ) : (
                            <li key={item.name} className='navItem'>
                                <Link to={item.href} className={`navButton ${item.current ? 'active' : ""}`}>
                                    <item.icon className='navIcon' />
                                    {item.name}
                                </Link>
                            </li>
                        )
                    )}
                </ul>
            </nav>
            {openModal && <Modal openModal={openModal} setOpenModal={setOpenModal} onSaveSuccess={onSaveSuccess}/>}
        </div>


    )
}

export default Sidebar