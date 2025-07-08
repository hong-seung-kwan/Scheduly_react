import { Calendar, CheckSquare, Home } from 'lucide-react'
import React from 'react'
import "../css/Sidebar.css";

const navigation = [
    {name: "홈 화면", href: "#", icon: Home, current:true},
    {name: "할 일", href: "#", icon: CheckSquare, current:false},
    {name: "캘린더", href:"#", icon: Calendar, current:false}

]

const Sidebar = () => {
  return (
    <div className='sidebar'>
        <div className='header'>
            <div className='logo'>
                <div className='logoIcon'>
                    <CheckSquare size={20}/>
                </div>
                <h2 className='logoText'>Scheduly</h2>
            </div>
        </div>

        <nav className='nav'>
            <ul className='navList'>
                {navigation.map((item) => (
                    <li key={item.name} className='navItem'>
                        <button className={`navButton ${item.current ? 'active' : ""}`}>
                            <item.icon className='navIcon'/>
                            {item.name}
                        </button>
                    </li>
                ))}
            </ul>
        </nav> 
    </div>

    
  )
}

export default Sidebar