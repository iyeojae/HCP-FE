// src/pages/main/MainPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/main/MainPage.css";
import api from "../../api/axios";

/** SVG들 */
import OpenStageSvg from "../../assets/main/map/open_stage.svg";
import StudentHallSvg from "../../assets/main/map/student_hall.svg";
import ArchHallSvg from "../../assets/main/map/arch_hall.svg";

import Booth1Svg from "../../assets/main/booths/booth_5.svg";
import Booth2Svg from "../../assets/main/booths/booth_7.svg";
import Booth3Svg from "../../assets/main/booths/booth_5.svg";
import Booth4Svg from "../../assets/main/booths/booth_1.svg";
import Booth5Svg from "../../assets/main/booths/booth_10.svg";
import Booth6Svg from "../../assets/main/booths/booth_1.svg";
import Booth7Svg from "../../assets/main/booths/booth_5.svg";
import Booth8Svg from "../../assets/main/booths/booth_1.svg";
import Booth9Svg from "../../assets/main/booths/booth_2.svg";
import Booth10Svg from "../../assets/main/booths/booth_10.svg";

import FoodTruckSvg from "../../assets/main/map/food_truck.svg";

/** category 코드 → 라벨 */
const CATEGORY_LABEL = {
  RELIGION: "종교",
  STUDY: "학습",
  SPORTS: "체육",
  ART: "예술",
  VOLUNTEER: "봉사",
  PERFORMANCE: "공연",
  HOBBY: "취미",
};

function resolveAssetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const base = api?.defaults?.baseURL || "";
  try {
    const u = new URL(base);
    const rootPath = u.pathname.replace(/\/api\/?$/, "");
    const root = `${u.origin}${rootPath}`.replace(/\/$/, "");
    return `${root}${path.startsWith("/") ? "" : "/"}${path}`;
  } catch {
    const clean = String(base).replace(/\/$/, "").replace(/\/api$/, "");
    return `${clean}${path.startsWith("/") ? "" : "/"}${path}`;
  }
}

function isSvgUrl(url) {
  return typeof url === "string" && url.toLowerCase().includes(".svg");
}

function normalizeClubDetail(raw) {
  if (!raw) return null;
  const d = raw?.data ?? raw?.result ?? raw; // 래핑 방어
  return {
    clubId: d.clubId,
    mainImageUrl: d.mainImageUrl,
    name: d.name,
    summary: d.summary,
    recruitState: d.recruitState,
    daysLeftToRecruitEnd: d.daysLeftToRecruitEnd,
    viewCount: d.viewCount,
    category: d.category,
    introduction: d.introduction,
    interviewProcess: d.interviewProcess,
  };
}

function SvgImg({ src, alt, className }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable="false"
      loading="lazy"
    />
  );
}

function MapIconButton({ className, label, onClick, active = false, children }) {
  return (
    <button
      type="button"
      className={`main-mapIconBtn ${className} ${active ? "is-active" : ""}`}
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </button>
  );
}

export default function MainPage() {
  const navigate = useNavigate();

  /**
   * ✅ clubId 매핑 (네가 준 값 반영 완료)
   * "없음" -> null
   */
  const CLUB_ID_MAP = useMemo(
    () => ({
      "booth-1": 22, // 정음
      "booth-2": 36, // ccc
      "booth-3": 20, // 무혼
      "booth-4": 15, // 라온
      "booth-5": null, // 크라이시스
      "booth-6": null, // 히바
      "booth-7": null, // 투메니엠씨
      "booth-8": 41, // 다원
      "booth-9": 34, // 시골풍경
      "booth-10": null, // 총동아리 연합회

      "booth9-sub-1": 40, // 나비
      "truckArea-booth-1": 13, // 한서랑붓다랑
      "truckArea-booth-2": 16, // 비상
      "truckArea-booth-3": 14, // 무브
    }),
    []
  );

  /** 기본 10개 부스 */
  const BOOTHS = useMemo(
    () => [
      { key: "booth-1", label: "부스 1", posClass: "pos-booth-1", svg: Booth1Svg },
      { key: "booth-2", label: "부스 2", posClass: "pos-booth-2", svg: Booth2Svg },
      { key: "booth-3", label: "부스 3", posClass: "pos-booth-3", svg: Booth3Svg },
      { key: "booth-4", label: "부스 4", posClass: "pos-booth-4", svg: Booth4Svg },
      { key: "booth-5", label: "부스 5", posClass: "pos-booth-5", svg: Booth5Svg },
      { key: "booth-6", label: "부스 6", posClass: "pos-booth-6", svg: Booth6Svg },
      { key: "booth-7", label: "부스 7", posClass: "pos-booth-7", svg: Booth7Svg },
      { key: "booth-8", label: "부스 8", posClass: "pos-booth-8", svg: Booth8Svg },
      { key: "booth-9", label: "부스 9", posClass: "pos-booth-9", svg: Booth9Svg },
      { key: "booth-10", label: "부스 10", posClass: "pos-booth-10", svg: Booth10Svg },
    ],
    []
  );

  /** 추가 부스 */
  const EXTRA_BOOTHS = useMemo(
    () => [
      { key: "truckArea-booth-1", label: "푸드존 부스 1", posClass: "pos-truckAreaBooth-1", svg: Booth1Svg },
      { key: "truckArea-booth-2", label: "푸드존 부스 2", posClass: "pos-truckAreaBooth-2", svg: Booth5Svg },
      { key: "truckArea-booth-3", label: "푸드존 부스 3", posClass: "pos-truckAreaBooth-3", svg: Booth2Svg },
      { key: "booth9-sub-1", label: "9번 하단 부스", posClass: "pos-booth-9-sub-1", svg: Booth4Svg },
    ],
    []
  );

  /** 푸드트럭 */
  const FOOD_TRUCKS = useMemo(
    () => [
      { key: "truck-1", label: "푸드트럭 1", posClass: "pos-truck-1", svg: FoodTruckSvg },
      { key: "truck-2", label: "푸드트럭 2", posClass: "pos-truck-2", svg: FoodTruckSvg },
      { key: "truck-3", label: "푸드트럭 3", posClass: "pos-truck-3", svg: FoodTruckSvg },
    ],
    []
  );

  const ALL_BOOTH_SLOTS = useMemo(
    () => [...BOOTHS, ...EXTRA_BOOTHS],
    [BOOTHS, EXTRA_BOOTHS]
  );

  /** 초기: 아무 부스도 선택 X */
  const [selectedKey, setSelectedKey] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [noInfo, setNoInfo] = useState(false);

  const selectedBoothSlot = useMemo(
    () => ALL_BOOTH_SLOTS.find((b) => b.key === selectedKey) || null,
    [ALL_BOOTH_SLOTS, selectedKey]
  );

  const clearCard = (key) => {
    setSelectedKey(key);
    setSelectedDetail(null);
    setNoInfo(false);
    setLoadingDetail(false);
  };

  const onClickBooth = async (booth) => {
    setSelectedKey(booth.key);
    setSelectedDetail(null);
    setNoInfo(false);

    const clubId = CLUB_ID_MAP[booth.key];

    // clubId 없으면: 부스 정보 없음
    if (!clubId) {
      setNoInfo(true);
      return;
    }

    setLoadingDetail(true);
    try {
      const res = await api.get(`/api/common/clubs/${clubId}`);
      const parsed = normalizeClubDetail(res.data);

      if (!parsed) {
        setNoInfo(true);
        return;
      }
      setSelectedDetail(parsed);
    } catch (e) {
      console.error("[MainPage] club detail error:", e);
      setNoInfo(true);
    } finally {
      setLoadingDetail(false);
    }
  };

  /** 상태 */
  const showClickPrompt = selectedBoothSlot == null && !loadingDetail;
  const showNoInfo = selectedBoothSlot != null && !loadingDetail && !selectedDetail && noInfo;
  const showLoaded = !!selectedDetail && !loadingDetail;

  /** 헤더는 로드 성공 시만 노출 */
  const clubName = selectedDetail?.name || "";
  const categoryCode = selectedDetail?.category || "";
  const categoryLabel = CATEGORY_LABEL[categoryCode] || categoryCode || "분야";

  /** 사진 1장만 */
  const imageUrl = resolveAssetUrl(selectedDetail?.mainImageUrl);
  const hasImage = !!imageUrl;

  /** 오오라(정보가 실제로 떠 있는 부스) */
  const glowKey = showLoaded ? selectedKey : null;

  /** ✅ 카드 클릭 시 상세로 이동 가능 여부 */
  const canGoDetail = showLoaded && !!selectedDetail?.clubId;

  const onClickCard = () => {
    if (!canGoDetail) return;
    navigate(`/clubs/${selectedDetail.clubId}`);
  };

  const onKeyDownCard = (e) => {
    if (!canGoDetail) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/clubs/${selectedDetail.clubId}`);
    }
  };

  return (
    <div className="main-page">
      <div className="main-page-content">
        {/* ================= 지도 ================= */}
        <section className="main-mapPanel" aria-label="축제 부스 지도">
          <div className="main-mapFrame">
            <div className="main-mapInner">
              <SvgImg
                src={OpenStageSvg}
                alt="야외공연장"
                className="main-buildingSvg main-buildingSvg--openStage"
              />
              <SvgImg
                src={StudentHallSvg}
                alt="학생회관"
                className="main-buildingSvg main-buildingSvg--studentHall"
              />
              <SvgImg
                src={ArchHallSvg}
                alt="건축관"
                className="main-buildingSvg main-buildingSvg--archHall"
              />

              {/* 기본 부스 10개 */}
              {BOOTHS.map((booth) => (
                <MapIconButton
                  key={booth.key}
                  className={`${booth.posClass} ${booth.key === "booth-10" ? "is-booth10" : ""} ${
                    glowKey === booth.key ? "is-glow" : ""
                  }`}
                  label={booth.label}
                  active={selectedKey === booth.key}
                  onClick={() => onClickBooth(booth)}
                >
                  <SvgImg src={booth.svg} alt="" className="main-mapIconSvg main-mapIconSvg--booth" />
                </MapIconButton>
              ))}

              {/* 추가 부스 4개 */}
              {EXTRA_BOOTHS.map((booth) => (
                <MapIconButton
                  key={booth.key}
                  className={`${booth.posClass} ${glowKey === booth.key ? "is-glow" : ""}`}
                  label={booth.label}
                  active={selectedKey === booth.key}
                  onClick={() => onClickBooth(booth)}
                >
                  <SvgImg src={booth.svg} alt="" className="main-mapIconSvg main-mapIconSvg--booth" />
                </MapIconButton>
              ))}

              {/* 푸드트럭 */}
              {FOOD_TRUCKS.map((t) => (
                <MapIconButton
                  key={t.key}
                  className={t.posClass}
                  label={t.label}
                  active={selectedKey === t.key}
                  onClick={() => clearCard(t.key)}
                >
                  <SvgImg src={t.svg} alt="" className="main-mapIconSvg main-mapIconSvg--truck" />
                </MapIconButton>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 하단 카드 ================= */}
        <section
          className={`main-clubCard ${canGoDetail ? "is-clickable" : ""}`}
          aria-label="선택한 동아리 정보"
          aria-busy={loadingDetail}
          onClick={onClickCard}
          onKeyDown={onKeyDownCard}
          role={canGoDetail ? "button" : undefined}
          tabIndex={canGoDetail ? 0 : undefined}
        >
          {/* ✅ 초기에는 헤더(동아리명/분야) 숨김 */}
          {showLoaded && (
            <div className="main-clubCard__head">
              <div className="main-clubCard__title">{clubName}</div>
              <div className="main-clubCard__tag">{categoryLabel}</div>
            </div>
          )}

          {showClickPrompt && (
            <div className="main-clubCard__messageWrap">
              <p className="main-clubCard__message">부스를 클릭해보세요.</p>
            </div>
          )}

          {loadingDetail && (
            <div className="main-clubCard__messageWrap">
              <p className="main-clubCard__message">불러오는 중...</p>
            </div>
          )}

          {showNoInfo && (
            <div className="main-clubCard__messageWrap">
              <p className="main-clubCard__message">부스 정보가 없습니다.</p>
            </div>
          )}

          {/* ✅ 로드 성공 */}
          {showLoaded && !hasImage && (
            <div className="main-clubCard__messageWrap">
              <p className="main-clubCard__message">등록된 사진이 없습니다.</p>
            </div>
          )}

          {showLoaded && hasImage && (
            <div className="main-clubCard__singleImage">
              <div className="main-clubCard__imgWrap">
                <img
                  className={`main-clubCard__img ${isSvgUrl(imageUrl) ? "is-svg" : ""}`}
                  src={imageUrl}
                  alt={`${clubName} 사진`}
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}