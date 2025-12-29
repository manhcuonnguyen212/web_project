import {useSelector} from 'react-redux' 

import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import "./AdminLayout.css";

function AdminLayout() {
  const user = useSelector((state)=>state.auth?.user)
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
