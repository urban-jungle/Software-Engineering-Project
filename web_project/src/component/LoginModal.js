import React, { useState } from "react";
import "../styles/loginmodal.css";

const LoginModal = () => {
  const [username, setID] = useState("");
  const [password, setPW] = useState("");

  const onChangeID = (event) => {
    setID(event.target.value);
  };

  const onChangePW = (event) => {
    setPW(event.target.value);
  };

  const clearInput = (type) => {
    if (type === "id") {
      setID("");
    } else if (type === "pw") {
      setPW("");
    }
  };

  // 로그인 핸들링
  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((response) => response.json()) // 응답 객체를 JSON 형식으로 파싱
      .then((data) => {
        alert(data.message);

        if (data.redirect_url) {
          window.location.href = data.redirect_url; // 클라이언트 사이드에서 리디렉션 처리
        }
      })
      .catch((error) => {
        console.error("Error:", error); // 에러 처리
      });
  };

  // 게스트 로그인
  const handleGuestLogin = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/guest_login", {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      alert(data.message);

      if (data.redirect_url) {
        window.location.href = data.redirect_url; // 클라이언트 사이드에서 리디렉션 처리
      }
    }
  };

  return (
    <div className="id-container">
      <div className="id-box">
        <form className="id-form" onSubmit={handleLogin}>
          <div className="id-bold">로그인</div>

          <div className="id-input-container">
            <input
              className="id-input_text"
              type="text"
              placeholder="ID"
              value={username}
              onChange={onChangeID}
            />
            {username && (
              <button
                type="button"
                onClick={() => clearInput("id")}
                className="id-clear-button"
              >
                X
              </button>
            )}
          </div>
          <div className="id-input-container">
            <input
              className="id-input_text"
              type="password"
              placeholder="PW"
              value={password}
              onChange={onChangePW}
            />
            {password && (
              <button
                type="button"
                onClick={() => clearInput("pw")}
                className="id-clear-button"
              >
                X
              </button>
            )}
          </div>
          <div className="id-button-container">
            <button type="submit" className="id-login-button">
              Login
            </button>
          </div>
        </form>

        <form onSubmit={handleGuestLogin} className="id-form">
          <div className="id-button-container">
            <button type="submit" className="id-login-button">
              Guest Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;