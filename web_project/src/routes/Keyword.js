import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "../styles/keyword.css";

import option_icon from "../icons/option.png";
import OptionModal from "../component/OptionModal";

export default function Keyword() {
  const [keyword, setSearch] = useState("");
  const [postuser, setPostuser] = useState([]); // 포스트 데이터 상태를 빈 배열로 초기화
  const [showOption, setShowOption] = useState({}); // 각 포스트별 showOption 상태 관리를 위한 객체

  // 버튼 클릭 시 메뉴 표시 상태를 토글하는 함수
  const toggleOption = (index) => {
    setShowOption((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  // PostList 핸들링
  const handlePostList = async (keyword) => {
    try {
      const response = await fetch("http://localhost:5000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword: keyword }),
      });
      if (response.ok) {
        const post_data = await response.json();
        setPostuser(post_data.postlist || []); // 서버로부터 data를 받아오고, postlist가 undefined일 경우 빈 배열로 설정
      } else {
        console.error("Failed to fetch post:", response.statusText);
      }
    } catch (error) {
      console.error("PostList Error:", error);
    }
  };

  // 사용자 이름을 받음
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const keyword = queryParams.get("keyword");

    setSearch(keyword); // keyword 값 갱신
    handlePostList(keyword);
  }, []); // 빈 배열을 전달하여 컴포넌트가 마운트될 때만 실행되도록 함

  return (
    <div className="key-container">
      <div className="key-display">
        <div className="key-post">검색결과</div>
        <Link to="/main">
          <button className="goto-main-button">메뉴로 돌아가기</button>
        </Link>
        {postuser.length > 0 ? ( // postuser 배열이 비어 있지 않을 경우에만 map 함수 호출
          postuser.map((post, index) => (
            <React.Fragment key={index}>
              <div className="key-board-container">
                <div className="key-board-bar">
                  <div className="key-user-name">{post.username}</div>

                  <div className="key-option-button-container">
                    <button
                      className="key-option-button"
                      onClick={() => toggleOption(index)}
                    >
                      <img
                        src={option_icon}
                        className="key-option-icon"
                        alt="option"
                      />
                    </button>
                  </div>
                </div>
                <img
                  src={`http://localhost:5000/static/${post.file}`}
                  className="key-board-picture"
                  alt="post"
                />
                <div className="key-board-hashtag">
                  {post.hashtags.map((hashtag, hashtagIndex) => (
                    <span
                      key={hashtagIndex}
                      className="key-board-hashtag-content"
                    >
                      {hashtag} &nbsp;
                    </span>
                  ))}
                </div>
                <div className="key-board-text">{post.text}</div>
              </div>
              {showOption[index] && (
                <div
                  className="key-option-select"
                  onClick={() => toggleOption(index)}
                >
                  <OptionModal name={post.username} file={post.file} />
                </div>
              )}
            </React.Fragment>
          ))
        ) : (
          <div>No results found</div> // 검색 결과가 없을 때 표시
        )}
      </div>
    </div>
  );
}
