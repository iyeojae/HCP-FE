import React from "react";
import "../../styles/common/WifiLoader.css";

export default function WifiLoader({ text = "Loading" }) {
  return (
    <div className="wifiLoader" role="status" aria-live="polite" aria-label="로딩 중">
      <svg className="circle-middle" viewBox="0 0 60 60" aria-hidden="true">
        <circle className="back" cx="30" cy="30" r="27"></circle>
        <circle className="front" cx="30" cy="30" r="27"></circle>
      </svg>
      <div className="text" data-text={text} />
    </div>
  );
}