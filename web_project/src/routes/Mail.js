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
      .then((response) => response.json())
      .then((data) => {
        setDmList(data.dm_list);
        if (data.redirect_url) {
          window.location.href = data.redirect_url;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

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

  const handleDMReply = async (sender) => {
    const response = await fetch("http://localhost:5000/gotoDMpage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: sender }),
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
    <div className="DM-container">
      <div className="DM-display">
        <div className="DM-user">DM List</div>
        {dmList.map((dm, index) => (
          <React.Fragment key={index}>
            <div className="DM-user-content">
              {dm.message}
              <br></br>- "{dm.sender}"님이 보냄
              <button
                className="DM-button"
                onClick={() => handleDMReply(dm.sender)}
              >
                Reply
              </button>
              <button
                className="DM-button"
                onClick={() => handleDMDelete(dm.message, dm.sender)}
              >
                Delete
              </button>
            </div>
          </React.Fragment>
        ))}
        <Link to="/main">
          <button className="DM-button">Home</button>
        </Link>
      </div>
    </div>
  );
}
