import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "../styles/keyword.css";

import option_icon from "../icons/option.png";
import OptionModal from "../component/OptionModal";

export default function Keyword() {
  const [keyword, setSearch] = useState("");
  const [postuser, setPostuser] = useState([]);
  const [showOption, setShowOption] = useState({});

  const toggleOption = (index) => {
    setShowOption((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

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
        setPostuser(post_data.postlist || []);
      } else {
        console.error("Failed to fetch post:", response.statusText);
      }
    } catch (error) {
      console.error("PostList Error:", error);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const keyword = queryParams.get("keyword");

    setSearch(keyword);
    handlePostList(keyword);
  }, []); 

  return (
    <div className="key-container">
      <div className="key-display">
        <div className="key-post">Result</div>
        <Link to="/main">
          <button className="goto-main-button">Menu</button>
        </Link>
        {postuser.length > 0 ? (
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
          <div>No results found</div>
        )}
      </div>
    </div>
  );
}
