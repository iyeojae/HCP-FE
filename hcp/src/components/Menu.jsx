import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Menu.css";

export default function Menu({ items = [] }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (to) => {
    if (!to) return false;
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  return (
    <nav className="app-menu" aria-label="하단 내비게이션">
      {items.slice(0, 3).map((item, idx) => {
        const active = isActive(item?.to);

        return (
          <button
            key={item?.to || idx}
            type="button"
            className={`app-menu__item ${active ? "active" : ""}`}
            onClick={() => item?.to && navigate(item.to)}
            aria-label={item?.label || `메뉴 ${idx + 1}`}
          >
            {item?.iconSrc ? (
              <img
                className="app-menu__iconImg"
                src={item.iconSrc}
                alt=""
                aria-hidden="true"
              />
            ) : (
              <div className="app-menu__iconSlot" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
