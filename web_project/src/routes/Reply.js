import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "../styles/reply.css";

export default function Reply() {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [text, setText] = useState(""); // 텍스트 입력 상태 추가

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  useEffect(() => {
    // URL에서 쿼리 파라미터 추출
    const queryParams = new URLSearchParams(window.location.search);
    const sender = queryParams.get("sender");
    const receiver = queryParams.get("receiver");

    setSender(sender);
    setReceiver(receiver);
  }, []);

  // DM 핸들링
  const handleDM = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/sendDM", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: sender,
        receiver: receiver,
        message: text,
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
    <div className="reply-container">
      <div className="reply-display">
        <form onSubmit={handleDM}>
          <div className="reply-user">DM 보내기</div>
          <textarea
            type="text"
            className="reply-reply"
            placeholder="내용을 입력하세요."
            value={text}
            onChange={handleTextChange}
          ></textarea>
          <div className="reply-button-container">
            <button className="reply-button">보내기</button>
          </div>
        </form>
        <Link to="/DirectMessage">
          <button className="reply-button">이전으로</button>
        </Link>
      </div>
    </div>
  );
}