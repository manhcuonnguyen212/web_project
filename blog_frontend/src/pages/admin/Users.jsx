import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axiosClient.get("/users").then((res) => setUsers(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa user này?")) return;
    await axiosClient.delete(`/users/${id}`);
    setUsers(users.filter((u) => u.user_id !== id));
  };

  return (
    <div>
      <h2>Quản lý Users</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id}>
              <td>{u.user_id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleDelete(u.user_id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
