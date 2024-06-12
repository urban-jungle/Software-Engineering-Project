import "../styles/upload.css";

import { Link } from "react-router-dom";

import React, { useState, useEffect } from "react";

export default function Fix() {
  const [fixMedia, setFixMedia] = useState(null);
  const [FixKey, setFixKey] = useState(Date.now());
  const [Fixhashtags, setFixHashtags] = useState([""]);
  const [Fixtext, setFixText] = useState("");

  const [filename, setFilename] = useState("");
  const [id, setID] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const filename = queryParams.get("filename");

    setFilename(filename);
    handleLoadID(filename);
  }, []);

  const handleLoadID = async (filename) => {
    const response = await fetch("http://localhost:5000/get_my_post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: filename }),
    })
      .then((response) => response.json())
      .then((data) => {
        const idValue = data.id.$oid;
        setID(idValue);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const onChangeMedia = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFixMedia(file);
    }
  };

  const onDeleteMedia = () => {
    setFixMedia(null);
    setFixKey(Date.now());
  };

  const addHashtagField = () => {
    setFixHashtags([...Fixhashtags, ""]);
  };

  const removeLastHashtagField = () => {
    setFixHashtags(Fixhashtags.slice(0, -1));
  };

  const handleHashtagChange = (index, value) => {
    const newHashtags = [...Fixhashtags];
    newHashtags[index] = value;
    setFixHashtags(newHashtags);
  };

  const handleTextChange = (e) => {
    setFixText(e.target.value);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const validHashtags = Fixhashtags.filter((tag) => tag.trim() !== "");

    if (!fixMedia || Fixtext.trim() === "" || validHashtags.length === 0) {
      alert(
        "사진 업로드, 해시태그, 글 작성이 필요합니다,"
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", fixMedia);
    formData.append("text", Fixtext);
    validHashtags.forEach((tag, index) => {
      formData.append(`hashtags[${index}]`, tag);
    });
    formData.append("id", id);

    const response = await fetch("http://localhost:5000/fix", {
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
            key={FixKey}
            type="file"
            accept="image/*"
            onChange={onChangeMedia}
            className="upload-picture"
          />
          {fixMedia && (
            <div>
              <img
                src={URL.createObjectURL(fixMedia)}
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

          {Fixhashtags.map((hashtag, index) => (
            <div key={index} className="hashtag-input-container">
              <input
                className="upload-hashtag"
                placeholder="Hashtag"
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
              Insert
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
            placeholder="설명을 적어주세요."
            type="text"
            value={Fixtext}
            onChange={handleTextChange}
          />
          <button className="upload-button">Upload</button>
        </form>

        <Link to="/main">
          <button className="upload-button">Cancel</button>
        </Link>
      </div>
    </div>
  );
}
