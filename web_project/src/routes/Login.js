import React, { useState } from "react";

import "../styles/login.css";
import logoImage from "../icons/instagram.png";
import LoginModal from "../component/LoginModal";
import SignUpModal from "../component/SignUpModal";
import googlestore from "../icons/Google Play.png";
import appstore from "../icons/App Store.png";
import newImageLeft from "../icons/newImageLeft.png";
import newImageRight from "../icons/newImageRight.png";

export default function Login() {
  const [isIDOpen, setIDOpen] = useState(false);
  const [isSignOpen, setSignOpen] = useState(false);

  const openIDModal = () => {
    setIDOpen(!isIDOpen);
  };

  const openSignModal = () => {
    setSignOpen(!isSignOpen);
  };

  return (
    <>
      <div className="login-main">
        <div className="images-vertical-container left-image">
          <img src={newImageLeft} alt="New Left Image" />
        </div>
        <div className="login-container">
          <p className="login-text">
            <img src={logoImage}/>
            <span className="login-black">Out &nbsp;</span>
            <span className="login-black">Stargram</span>
          </p>
          <div className="login-button">
            <button
              className="login-button-text"
              onClick={() => openIDModal(true)}
            >
              로그인
            </button>
            <button
              className="login-button-text"
              onClick={() => openSignModal(true)}
            >
              회원가입
            </button>
          </div>
        </div>
        <div className="images-container">
          <img src={googlestore} alt="Sample 1" className="login-image" />
          <img src={appstore} alt="Sample 2" className="login-image" />
        </div>
        <div className="images-vertical-container right-image">
          <img src={newImageRight} alt="New Right Image" />
        </div>
      </div>

      <div className="ModalContainer">
        {isIDOpen && (
          <div>
            <div className="ModalBackdrop" onClick={openIDModal}>
              <div onClick={(e) => e.stopPropagation()}>
                <LoginModal></LoginModal>
              </div>
            </div>
          </div>
        )}

        {isSignOpen && (
          <div>
            <div className="ModalBackdrop" onClick={openSignModal}>
              <div onClick={(e) => e.stopPropagation()}>
                <SignUpModal></SignUpModal>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
