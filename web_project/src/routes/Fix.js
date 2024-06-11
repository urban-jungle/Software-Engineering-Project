import "../styles/upload.css";

import { Link } from "react-router-dom";

import React, { useState, useEffect } from "react";

export default function Fix() {
  const [fixMedia, setFixMedia] = useState(null);
  const [FixKey, setFixKey] = useState(Date.now());
  const [Fixhashtags, setFixHashtags] = useState([""]);
  const [Fixtext, setFixText] = useState(""); // 텍스트 입력 상태 추가

  const [filename, setFilename] = useState("");
  const [id, setID] = useState("");

  useEffect(() => {
    // URL에서 쿼리 파라미터 추출
    const queryParams = new URLSearchParams(window.location.search);
    const filename = queryParams.get("filename");

    // filename 상태 업데이트
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
      .then((response) => response.json()) // 응답 객체를 JSON 형식으로 파싱
      .then((data) => {
        const idValue = data.id.$oid;
        setID(idValue);
      })
      .catch((error) => {
        console.error("Error:", error); // 에러 처리
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

    // 해시태그 배열에서 빈 문자열을 제거한 후 유효한 해시태그만 남깁니다.
    const validHashtags = Fixhashtags.filter((tag) => tag.trim() !== "");

    // 업로드된 미디어, 텍스트, 해시태그 중 하나라도 없는 경우 경고를 표시합니다.
    if (!fixMedia || Fixtext.trim() === "" || validHashtags.length === 0) {
      alert(
        "업로드한 사진, 해시태그, 텍스트 중 하나라도 없으면 업로드가 안됩니다."
      );
      return; // 함수를 더 이상 진행하지 않고 종료합니다.
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
                삭제
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
              추가
            </button>
            <button
              type="button"
              onClick={removeLastHashtagField}
              className="hashtag-button"
            >
              마지막 hashtag 삭제
            </button>
          </div>
          <textarea
            className="upload-text"
            placeholder="설명을 적어주세요."
            type="text"
            value={Fixtext}
            onChange={handleTextChange}
          />
          <button className="upload-button">업로드</button>
        </form>

        <Link to="/main">
          <button className="upload-button">취소</button>
        </Link>
      </div>
    </div>
  );
}