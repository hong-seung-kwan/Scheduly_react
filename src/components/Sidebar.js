import { Calendar, CardSim, CheckSquare, Home, LogIn, LogOut, Plus, UserPen } from 'lucide-react'
import React, { useState } from 'react'
import "../css/Sidebar.css";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/memberSlice';
import { clearEvents } from '../store/eventSlice';
import { Modal } from "../features/ApiModal";



const Sidebar = () => {

    const [openModal, setOpenModal] = useState(false);

    const user = useSelector((state) => state.member.info);
    const isLogIn = !!user;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {

        dispatch(logout());

        dispatch(clearEvents());

        navigate("/");

    }

    const navigation = [
        { name: "홈 화면", href: "/", icon: Home, current: true },
        
        isLogIn
            ? { name: "로그아웃", href: "/", icon: LogOut, current: false }
            : ({ name: "로그인", href: "/login", icon: LogIn, current: false },
              { name: "회원가입", href: "/register", icon: UserPen, current: false }),
        { name: "게시판", href: "/board/main", icon: CardSim, current: false },
        { name: "캘린더", href: "#", icon: Calendar, current: false },
        { name: "API", href: "#", icon: Plus, current: false }

    ]



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
                        ) : item.name === "API" ? (
                            <li key={item.name} className='navItem'>
                                <button className='navButton' onClick={() => setOpenModal(true)}>
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
            {openModal && <Modal openModal={openModal} setOpenModal={setOpenModal} />}
        </div>


    )
}

export default Sidebar