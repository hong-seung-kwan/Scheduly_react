import { Calendar, CheckSquare, Home, LogIn, UserPen } from 'lucide-react'
import React from 'react'
import "../css/Sidebar.css";
import { Link } from 'react-router-dom';

const navigation = [
    { name: "홈 화면", href: "/", icon: Home, current: true },
    { name: "회원가입", href: "/register", icon: UserPen, current: false },
    { name: "로그인", href: "/login", icon: LogIn, current: false },
    { name: "할 일", href: "#", icon: CheckSquare, current: false },
    { name: "캘린더", href: "#", icon: Calendar, current: false }

]

const Sidebar = () => {



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
                    {navigation.map((item) => (
                        <li key={item.name} className='navItem'>
                            <Link to={item.href} className={`navButton ${item.current ? 'active' : ""}`}>
                                <item.icon className='navIcon' />
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>


    )
}

export default Sidebar