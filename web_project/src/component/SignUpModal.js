import React, { useState } from "react";

import "../styles/signupmodal.css";

const PasswordModal = () => {
  const [username, setID] = useState("");
  const [password, setnewPW] = useState("");
  const [password_confirm, setcheckPW] = useState("");

  const onChangeOriPW = (event) => {
    setID(event.target.value);
  };

  const onChangeNewPW = (event) => {
    setnewPW(event.target.value);
  };
  const onChangeCheckPW = (event) => {
    setcheckPW(event.target.value);
  };

  const handleSingUp = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        password_confirm: password_confirm,
      }),
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

  return (
    <div className="sign-container">
      <div className="sign-box">
        <div className="sign-bold">회원 가입</div>
        <form className="sign-box" onSubmit={handleSingUp}>
          <div className="sign-input-container">
            <input
              className="sign-input_text"
              type="text"
              placeholder="ID"
              value={username}
              onChange={onChangeOriPW}
            />
          </div>
          <div className="sign-input-container">
            <input
              className="sign-input_text"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={onChangeNewPW}
            />
          </div>
          <div className="sign-input-container">
            <input
              className="sign-input_text"
              type="password"
              placeholder="비밀번호 확인"
              value={password_confirm}
              onChange={onChangeCheckPW}
            />
          </div>

          <div className="sign-confirm-container">
            <button className="sign-confirm-button">확 인</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;