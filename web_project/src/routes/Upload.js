import "../styles/upload.css";

import { Link } from "react-router-dom";

import React, { useState } from "react";

export default function Upload() {
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [inputKey, setInputKey] = useState(Date.now());
  const [hashtags, setHashtags] = useState([""]);
  const [text, setText] = useState("");

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

    const validHashtags = hashtags.filter((tag) => tag.trim() !== "");

    if (!uploadedMedia || text.trim() === "" || validHashtags.length === 0) {
      alert(
        "사진 업로드, 해시태그 추가, 글 작성을 완료해야합니다."
      );
      return;
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
                Delete
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
              Create Hashtag
            </button>
            <button
              type="button"
              onClick={removeLastHashtagField}
              className="hashtag-button"
            >
              Delete Hashtag
            </button>
          </div>
          <textarea
            className="upload-text"
            placeholder="설명"
            type="text"
            value={text}
            onChange={handleTextChange}
          />
          <button className="upload-button">Upload</button>
        </form>

        <Link to="/main">
          <button className="upload-button">Go back</button>
        </Link>
      </div>
    </div>
  );
}
