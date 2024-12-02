import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";

// Google OAuth Client ID
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
console.log("🚀 ~ CLIENT_ID:", CLIENT_ID);

type User = {
  id: string;
  name: { fullName: string };
  primaryEmail: string;
};

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null); // Access Token 저장
  const [users, setUsers] = useState<User[]>([]); // 사용자 목록 저장
  console.log("🚀 ~ token:", token);

  // Google 로그인 성공 핸들러
  const handleLoginSuccess = (response: any) => {
    console.log("Login Success!", response);
    setToken(response.credential); // OAuth 2.0 credential을 토큰으로 저장
  };

  // Google 로그인 실패 핸들러
  const handleLoginFailure = (error: any) => {
    console.error("Login Failed", error);
  };

  // Directory API 호출
  const fetchUsers = async () => {
    if (!token) {
      alert("먼저 로그인하세요!");
      return;
    }

    try {
      const res = await axios.get(
        "https://admin.googleapis.com/admin/directory/v1/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            customer: "my_customer", // 기본 고객 ID
            maxResults: 10, // 결과 제한
          },
        }
      );

      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Error fetching users", error);
      alert("API 호출 실패!");
    }
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div style={{ padding: "20px" }}>
        <h1>Google Admin SDK Directory API</h1>

        {/* Google Login 버튼 */}
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleLoginFailure}
        />

        {/* API 호출 버튼 */}
        <button onClick={fetchUsers} style={{ marginTop: "20px" }}>
          사용자 가져오기
        </button>

        {/* 사용자 목록 */}
        {users.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h2>사용자 목록</h2>
            <ul>
              {users.map((user) => (
                <li key={user.id}>
                  {user.name.fullName} ({user.primaryEmail})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;
