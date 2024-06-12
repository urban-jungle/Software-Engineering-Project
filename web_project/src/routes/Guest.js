import React, { useState, useEffect } from "react";

import "../styles/guest.css";
import logoImage from "../icons/instagram.png";
import profileImage from "../icons/profile_img.png";

export default function Guest() {
  const [userlist, setUserList] = useState([]);

  const handleUserList = async () => {
    try {
      const response = await fetch("http://localhost:5000/userlists", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setUserList(data.userlist);
      } else {
        console.error("Failed to fetch user:", response.statusText);
      }
    } catch (error) {
      console.error("UserList Error:", error);
    }
  };

  useEffect(() => {
    handleUserList();
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/logout", {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      alert(data.message);

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    }
  };

  return (
    <div className="main-container">
      <div className="main-bar">
        <div className="main-logo-text">
          <img src={logoImage}/>
          <div className="main-logo">Out &nbsp;</div>
          <div className="main-logo-black">Stargram</div>
        </div>
        <div className="main-right-bar">
          <div className="main-username">
          <img src={profileImage}/>Guest</div>
          <form className="button-style" onSubmit={handleLogout}>
            <button className="main-Logout">Logout</button>
          </form>
        </div>
      </div>

      <div className="main-display">
        <div className="main-content">
          <div className="main-post">Post</div>
          <p className="main-guest">로그인 하십시오.</p>
        </div>

        <div className="main-content">
          <div className="main-userlist-container">
            <div className="main-user">User List</div>
            {userlist.map((user, index) => (
              <div className="main-userlist">{user.username}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
