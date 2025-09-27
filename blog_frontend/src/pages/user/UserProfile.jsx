import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function UserProfile() {
  const [user, setUser] = useState({});
  const userId = 1; // TODO: lấy từ token

  useEffect(() => {
    axiosClient.get(`/users/${userId}`).then((res) => setUser(res.data));
  }, [userId]);

  const handleSave = async () => {
    await axiosClient.put(`/users/${userId}`, user);
    alert("Cập nhật thành công!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Thông tin tài khoản</h2>
      <input
        type="text"
        value={user.name || ""}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
      />
      <br />
      <input
        type="text"
        value={user.address || ""}
        onChange={(e) => setUser({ ...user, address: e.target.value })}
      />
      <br />
      <input
        type="text"
        value={user.phone || ""}
        onChange={(e) => setUser({ ...user, phone: e.target.value })}
      />
      <br />
      <button onClick={handleSave}>Lưu</button>
    </div>
  );
}
