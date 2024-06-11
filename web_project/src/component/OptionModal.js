import React, { useState } from "react";
import "../styles/optionmodal.css";

export default function OptionModal(props) {
  // 수정 핸들링
  const handleFix = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/gotofixpage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: props.name, filename: props.file }),
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

  // DM 핸들링
  const handleDM = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/gotoDMpage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: props.name }),
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
    <div className="option-container">
      <div className="option-box">
        <form className="option-form">
          <div className="option-bold">옵션</div>

          <div className="option-button-container">
            <button type="submit" className="option-button" onClick={handleFix}>
              수정하기
            </button>
          </div>
          <div className="option-button-container">
            <button type="submit" className="option-button" onClick={handleDM}>
              Direct Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}