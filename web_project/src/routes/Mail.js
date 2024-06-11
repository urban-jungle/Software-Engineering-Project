import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "../styles/mail.css";

export default function Mail() {
  const [dmList, setDmList] = useState([]);

  useEffect(() => {
    handleDMList();
  }, []);

  // DM 핸들링
  const handleDMList = async () => {
    const response = await fetch("http://localhost:5000/dm", {
      method: "GET",
    })
      .then((response) => response.json()) // 응답 객체를 JSON 형식으로 파싱
      .then((data) => {
        setDmList(data.dm_list);
        if (data.redirect_url) {
          window.location.href = data.redirect_url; // 클라이언트 사이드에서 리디렉션 처리
        }
      })
      .catch((error) => {
        console.error("Error:", error); // 에러 처리
      });
  };

  // DM 삭제 핸들링
  const handleDMDelete = async (message, sender) => {
    const response = await fetch("http://localhost:5000/delete_dm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        username: sender,
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

  // DM 답장 핸들링
  const handleDMReply = async (sender) => {
    const response = await fetch("http://localhost:5000/gotoDMpage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: sender }),
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
    <div className="DM-container">
      <div className="DM-display">
        <div className="DM-user">DM List</div>
        {dmList.map((dm, index) => (
          <React.Fragment key={index}>
            <div className="DM-user-content">
              {dm.message}
              <br></br>- from"{dm.sender}"
              <button
                className="DM-button"
                onClick={() => handleDMReply(dm.sender)}
              >
                reply
              </button>
              <button
                className="DM-button"
                onClick={() => handleDMDelete(dm.message, dm.sender)}
              >
                delete
              </button>
            </div>
          </React.Fragment>
        ))}
        <Link to="/main">
          <button className="DM-button">뒤로가기</button>
        </Link>
      </div>
    </div>
  );
}