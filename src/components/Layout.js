import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../css/Layout.css";


function Layout() {
    return (
        <div className="layoutcontainer">
            <Sidebar />
            <main className="maincontent">
            <Outlet />
            </main>
        </div>
    )
}

export default Layout;