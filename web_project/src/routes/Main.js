import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "../styles/main.css";
import logoImage from "../icons/instagram.png";
import search_icon from "../icons/search.png";
import option_icon from "../icons/option.png";
import dm_icon from "../icons/dm.png";
import OptionModal from "../component/OptionModal";
import profileImage from "../icons/profile_img.png";

export default function Main() {
  const [keyword, setSearch] = useState("");
  const [username, setUsername] = useState("");

  const [postuser, setPostuser] = useState([]); // 포스트 데이터 상태
  const [showOption, setShowOption] = useState({}); // 각 포스트별 showOption 상태 관리를 위한 객체

  // 버튼 클릭 시 메뉴 표시 상태를 토글하는 함수
  const toggleOption = (index) => {
    setShowOption((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const onChangeSearch = (event) => {
    setSearch(event.target.value);
  };

  const [userlist, setUserList] = useState([]);

  // UserList 핸들링
  const handleUserList = async () => {
    try {
      const response = await fetch("http://localhost:5000/userlists", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setUserList(data.userlist); // 서버로부터 data를 받아옴
      } else {
        console.error("Failed to fetch user:", response.statusText);
      }
    } catch (error) {
      console.error("UserList Error:", error);
    }
  };

  // PostList 핸들링
  const handlePostList = async () => {
    try {
      const response = await fetch("http://localhost:5000/postlists", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.redirect_url) {
          console.log(data.message);
          // window.location.href = data.redirect_url; // 클라이언트 사이드에서 리디렉션 처리
        }
        setPostuser(data.postlist); // 서버로부터 data를 받아옴
      } else {
        console.error("Failed to fetch post:", response.statusText);
      }
    } catch (error) {
      console.error("PostList Error:", error);
    }
  };

  // 사용자 이름을 받음
  useEffect(() => {
    const handleUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/user", {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          // username을 상태에 저장하거나 다른 로직을 실행
          setUsername(data.username);
        } else {
          console.error("Failed to fetch user:", response.statusText);
        }
      } catch (error) {
        console.error("USER Error:", error);
      }
    };

    handleUser(); // 로그인 된 user가 누구인지
    handleUserList(); // user list
    handlePostList(); //  게시글 list
  }, []); // 빈 배열을 전달하여 컴포넌트가 마운트될 때만 실행되도록 함

  // 로그아웃
  const handleLogout = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/logout", {
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

  // 검색 페이지로 이동
  const handleKeyword = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/gotokeywordpage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keyword: keyword }),
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
    <div className="main-container">
      <div className="main-bar">
        <div className="main-logo-text">
          <img src={logoImage} alt="Logo" />
          <div className="main-logo">Out &nbsp;</div>
          <div className="main-logo-black">Stargram</div>
          <div className="main-search-bar">
            <form className="button-style" onSubmit={handleKeyword}>
              <input
                className="main-search-text"
                type="text"
                placeholder="태그로 검색"
                value={keyword}
                onChange={onChangeSearch}
              />
              <button className="search-keyword-button">
                <img src={search_icon} className="search-keyword-icon" alt="Search" />
              </button>
            </form>
          </div>
        </div>
        <div className="main-right-bar">
          <div className="main-username">
            <img src = {profileImage} alt="Profile"></img>
            {username}
            </div>

          <Link to="/upload" className="button-style">
            <button className="main-upload">Upload</button>
          </Link>

          <Link to="/DirectMessage" className="button-style">
            <button className="main-DM">
              <img src={dm_icon} alt="Direct Message" />
            </button>
          </Link>

          <form onSubmit={handleLogout} className="button-style">
            <button className="main-Logout">Logout</button>
          </form>
        </div>
      </div>

      <div className="main-display">
        <div className="main-content">
          <div className="main-post">Post</div>
          {postuser.map((post, index) => (
            <React.Fragment key={index}>
              <div className="main-board-container">
                <div className="main-board-bar">
                  <div className="main-user-name">{post.username}</div>

                  <div className="main-option-button-container">
                    <button
                      className="main-option-button"
                      onClick={() => toggleOption(index)}
                    >
                      <img
                        src={option_icon}
                        className="main-option-icon"
                        alt="option"
                      />
                    </button>
                  </div>
                </div>
                <img
                  src={`http://localhost:5000/static/${post.file}`}
                  className="main-board-picture"
                  alt="post"
                />
                <div className="main-board-hashtag">
                  {post.hashtags.map((hashtag, hashtagIndex) => (
                    <span
                      key={hashtagIndex}
                      className="main-board-hashtag-content"
                    >
                      #{hashtag} &nbsp;
                    </span>
                  ))}
                </div>
                <div className="main-board-text">{post.text}</div>
              </div>
              {showOption[index] && (
                <div
                  className="main-option-select"
                  onClick={() => toggleOption(index)}
                >
                  <OptionModal name={post.username} file={post.file} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="main-content">
          <div className="main-userlist-container">
            <div className="main-user">User List</div>
            {userlist.map((user, index) => (
              <div className="main-userlist" key={index}>{user.username}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
