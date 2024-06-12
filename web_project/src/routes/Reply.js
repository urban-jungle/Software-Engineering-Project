import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "../styles/reply.css";

export default function Reply() {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [text, setText] = useState("");

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const sender = queryParams.get("sender");
    const receiver = queryParams.get("receiver");

    setSender(sender);
    setReceiver(receiver);
  }, []);

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
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        if (data.redirect_url) {
          window.location.href = data.redirect_url;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="reply-container">
      <div className="reply-display">
        <form onSubmit={handleDM}>
          <div className="reply-user">Sending DM</div>
          <textarea
            type="text"
            className="reply-reply"
            placeholder="내용을 입력하세요."
            value={text}
            onChange={handleTextChange}
          ></textarea>
          <div className="reply-button-container">
            <button className="reply-button">Send</button>
          </div>
        </form>
        <Link to="/DirectMessage">
          <button className="reply-button">Go back</button>
        </Link>
      </div>
    </div>
  );
}
