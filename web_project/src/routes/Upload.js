import "../styles/upload.css";

import { Link } from "react-router-dom";

import React, { useState } from "react";

export default function Upload() {
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [inputKey, setInputKey] = useState(Date.now());
  const [hashtags, setHashtags] = useState([""]);
  const [text, setText] = useState(""); // 텍스트 입력 상태 추가

  const onChangeMedia = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedMedia(file);
    }
  };

  const onDeleteMedia = () => {
    setUploadedMedia(null);
    setInputKey(Date.now());
  };

  const addHashtagField = () => {
    setHashtags([...hashtags, ""]);
  };

  const removeLastHashtagField = () => {
    setHashtags(hashtags.slice(0, -1));
  };

  const handleHashtagChange = (index, value) => {
    const newHashtags = [...hashtags];
    newHashtags[index] = value;
    setHashtags(newHashtags);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    // 해시태그 배열에서 빈 문자열을 제거한 후 유효한 해시태그만 남깁니다.
    const validHashtags = hashtags.filter((tag) => tag.trim() !== "");

    // 업로드된 미디어, 텍스트, 해시태그 중 하나라도 없는 경우 경고를 표시합니다.
    if (!uploadedMedia || text.trim() === "" || validHashtags.length === 0) {
      alert(
        "업로드한 사진, 해시태그, 텍스트 중 하나라도 없으면 업로드가 안됩니다."
      );
      return; // 함수를 더 이상 진행하지 않고 종료합니다.
    }

    const formData = new FormData();
    formData.append("file", uploadedMedia);
    formData.append("text", text);
    validHashtags.forEach((tag, index) => {
      formData.append(`hashtags[${index}]`, tag);
    });

    const response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
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
    <div className="upload-container">
      <div className="upload-display">
        <form className="upload-display" onSubmit={handleUpload}>
          <input
            key={inputKey}
            type="file"
            accept="image/*"
            onChange={onChangeMedia}
            className="upload-picture"
          />
          {uploadedMedia && (
            <div>
              <img
                src={URL.createObjectURL(uploadedMedia)}
                alt="Preview"
                className="media-preview-image"
              />

              <button
                type="button"
                onClick={onDeleteMedia}
                className="delete-button"
              >
                삭제
              </button>
            </div>
          )}

          {hashtags.map((hashtag, index) => (
            <div key={index} className="hashtag-input-container">
              <input
                className="upload-hashtag"
                placeholder="태그"
                type="text"
                value={hashtag}
                onChange={(e) => handleHashtagChange(index, e.target.value)}
              />
            </div>
          ))}

          <div className="hashtag-buttons-container">
            <button
              type="button"
              onClick={addHashtagField}
              className="hashtag-button"
            >
              태그 추가
            </button>
            <button
              type="button"
              onClick={removeLastHashtagField}
              className="hashtag-button"
            >
              태그 삭제
            </button>
          </div>
          <textarea
            className="upload-text"
            placeholder="설명"
            type="text"
            value={text}
            onChange={handleTextChange}
          />
          <button className="upload-button">게시</button>
        </form>

        <Link to="/main">
          <button className="upload-button">돌아가기</button>
        </Link>
      </div>
    </div>
  );
}