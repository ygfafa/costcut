// import React, { useState } from "react";
// import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
// import axios from "axios";

// // Google OAuth Client ID
// const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
// console.log("🚀 ~ CLIENT_ID:", CLIENT_ID);

// type User = {
//   id: string;
//   name: { fullName: string };
//   primaryEmail: string;
// };

// const App: React.FC = () => {
//   const [token, setToken] = useState<string | null>(null); // Access Token 저장
//   const [users, setUsers] = useState<User[]>([]); // 사용자 목록 저장
//   console.log("🚀 ~ token:", token);

//   // Google 로그인 성공 핸들러
//   const handleLoginSuccess = (response: any) => {
//     console.log("Login Success!", response);
//     setToken(response.credential); // OAuth 2.0 credential을 토큰으로 저장
//   };

//   // Google 로그인 실패 핸들러
//   const handleLoginFailure = (error: any) => {
//     console.error("Login Failed", error);
//   };

//   // Directory API 호출
//   const fetchUsers = async () => {
//     if (!token) {
//       alert("먼저 로그인하세요!");
//       return;
//     }

//     try {
//       const res = await axios.get(
//         "https://admin.googleapis.com/admin/directory/v1/users",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           params: {
//             customer: "my_customer", // 기본 고객 ID
//             maxResults: 10, // 결과 제한
//           },
//         }
//       );

//       setUsers(res.data.users || []);
//     } catch (error) {
//       console.error("Error fetching users", error);
//       alert("API 호출 실패!");
//     }
//   };

//   return (
//     <GoogleOAuthProvider clientId={CLIENT_ID}>
//       <div style={{ padding: "20px" }}>
//         <h1>Google Admin SDK Directory API</h1>

//         {/* Google Login 버튼 */}
//         <GoogleLogin
//           onSuccess={handleLoginSuccess}
//           onError={handleLoginFailure}

//         />

//         {/* API 호출 버튼 */}
//         <button onClick={fetchUsers} style={{ marginTop: "20px" }}>
//           사용자 가져오기
//         </button>

//         {/* 사용자 목록 */}
//         {users.length > 0 && (
//           <div style={{ marginTop: "20px" }}>
//             <h2>사용자 목록</h2>
//             <ul>
//               {users.map((user) => (
//                 <li key={user.id}>
//                   {user.name.fullName} ({user.primaryEmail})
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </GoogleOAuthProvider>
//   );
// };

// export default App;

import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import axios from "axios";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string;
const SCOPES = "https://www.googleapis.com/auth/admin.directory.user.readonly";

const GapiAuthExample = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [token, setToken] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // GAPI 초기화
    const initGapi = () => {
      gapi.load("client:auth2", () => {
        gapi.client
          .init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            scope: SCOPES,
          })
          .then(() => {
            const authInstance = gapi.auth2.getAuthInstance();
            setIsSignedIn(authInstance.isSignedIn.get());
            authInstance.isSignedIn.listen(setIsSignedIn);
          });
      });
    };

    initGapi();
  }, []);

  // 로그인 핸들러
  const handleSignIn = async () => {
    const authInstance = gapi.auth2.getAuthInstance();
    try {
      const user = await authInstance.signIn();
      const accessToken = user.getAuthResponse().access_token;
      setToken(accessToken);
      console.log("Access Token:", accessToken);
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  // 로그아웃 핸들러
  const handleSignOut = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signOut().then(() => {
      setToken("");
      setUsers([]);
      console.log("로그아웃 성공");
    });
  };

  // Admin SDK API 호출
  const fetchUsers = async () => {
    if (!token) {
      alert("먼저 로그인하세요!");
      return;
    }

    try {
      const response = await axios.get(
        "https://admin.googleapis.com/admin/directory/v1/users",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Bearer 토큰 추가
          },
          params: {
            customer: "my_customer",
            maxResults: 10,
          },
        }
      );

      setUsers(response.data.users || []);
    } catch (error) {
      console.error(
        "사용자 목록을 가져오는 데 실패했습니다:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div>
      <h1>Google OAuth with GAPI</h1>
      {isSignedIn ? (
        <div>
          <button onClick={handleSignOut}>로그아웃</button>
          <button onClick={fetchUsers}>사용자 가져오기</button>
          <p>{JSON.stringify(users, null, 4)}</p>
        </div>
      ) : (
        <button onClick={handleSignIn}>Google 로그인</button>
      )}
    </div>
  );
};

export default GapiAuthExample;
