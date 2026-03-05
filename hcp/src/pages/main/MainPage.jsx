// src/pages/main/MainPage.jsx
import React, { useMemo, useState } from "react";
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

function fillTo3(url) {
  if (!url) return [null, null, null];
  return [url, url, url];
}

function isSvgUrl(url) {
  return typeof url === "string" && url.toLowerCase().includes(".svg");
}

function normalizeClubDetail(raw) {
  if (!raw) return null;
  return {
    clubId: raw.clubId,
    mainImageUrl: raw.mainImageUrl,
    name: raw.name,
    summary: raw.summary,
    recruitState: raw.recruitState,
    daysLeftToRecruitEnd: raw.daysLeftToRecruitEnd,
    viewCount: raw.viewCount,
    category: raw.category,
    introduction: raw.introduction,
    interviewProcess: raw.interviewProcess,
  };
}

function SvgImg({ src, alt, className }) {
  return <img src={src} alt={alt} className={className} draggable="false" loading="lazy" />;
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
  /**
   * ✅ clubId 매핑 (네가 준 값 반영 완료)
   * "없음" -> null 처리
   */
  const CLUB_ID_MAP = useMemo(
    () => ({
      "booth-1": 22,           // 정음
      "booth-2": 36,           // ccc
      "booth-3": 20,           // 무혼
      "booth-4": 15,           // 라온
      "booth-5": null,         // 크라이시스 (없음)
      "booth-6": null,         // 히바 (없음)
      "booth-7": null,         // 투메니엠씨 (없음)
      "booth-8": 41,           // 다원
      "booth-9": 34,           // 시골풍경
      "booth-10": null,        // 총동아리 연합회 (없음)

      "booth9-sub-1": 40,      // 나비
      "truckArea-booth-1": 13, // 한서랑붓다랑
      "truckArea-booth-2": 16, // 비상
      "truckArea-booth-3": 14, // 무브
    }),
    []
  );

  /** 기본 10개 부스 */
  const BOOTHS = useMemo(
    () => [
      { key: "booth-1", label: "부스 1", posClass: "pos-booth-1", svg: Booth1Svg, clubName: "정음" },
      { key: "booth-2", label: "부스 2", posClass: "pos-booth-2", svg: Booth2Svg, clubName: "ccc" },
      { key: "booth-3", label: "부스 3", posClass: "pos-booth-3", svg: Booth3Svg, clubName: "무혼" },
      { key: "booth-4", label: "부스 4", posClass: "pos-booth-4", svg: Booth4Svg, clubName: "라온" },
      { key: "booth-5", label: "부스 5", posClass: "pos-booth-5", svg: Booth5Svg, clubName: "크라이시스" },
      { key: "booth-6", label: "부스 6", posClass: "pos-booth-6", svg: Booth6Svg, clubName: "히바" },
      { key: "booth-7", label: "부스 7", posClass: "pos-booth-7", svg: Booth7Svg, clubName: "투메니엠씨" },
      { key: "booth-8", label: "부스 8", posClass: "pos-booth-8", svg: Booth8Svg, clubName: "다원" },
      { key: "booth-9", label: "부스 9", posClass: "pos-booth-9", svg: Booth9Svg, clubName: "시골풍경" },
      { key: "booth-10", label: "부스 10", posClass: "pos-booth-10", svg: Booth10Svg, clubName: "총동아리 연합회" },
    ],
    []
  );

  /** 추가 부스 */
  const EXTRA_BOOTHS = useMemo(
    () => [
      { key: "truckArea-booth-1", label: "푸드존 부스 1", posClass: "pos-truckAreaBooth-1", svg: Booth1Svg, clubName: "한서랑붓다랑" },
      { key: "truckArea-booth-2", label: "푸드존 부스 2", posClass: "pos-truckAreaBooth-2", svg: Booth5Svg, clubName: "비상" },
      { key: "truckArea-booth-3", label: "푸드존 부스 3", posClass: "pos-truckAreaBooth-3", svg: Booth2Svg, clubName: "무브" },
      { key: "booth9-sub-1", label: "9번 하단 부스", posClass: "pos-booth-9-sub-1", svg: Booth4Svg, clubName: "나비" },
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

  const ALL_BOOTH_SLOTS = useMemo(() => [...BOOTHS, ...EXTRA_BOOTHS], [BOOTHS, EXTRA_BOOTHS]);

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

    // ✅ clubId가 null이면 "부스 정보가 없습니다"
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

  const cardName = selectedDetail?.name || "동아리명";
  const categoryCode = selectedDetail?.category || "";
  const cardCategory = CATEGORY_LABEL[categoryCode] || categoryCode || "분야";

  const cardMainImage = resolveAssetUrl(selectedDetail?.mainImageUrl);
  const cardImages = fillTo3(cardMainImage);

  const showClickPrompt = selectedBoothSlot == null && !loadingDetail;
  const showNoInfo = selectedBoothSlot != null && !loadingDetail && !selectedDetail && noInfo;
  const showImages = !!selectedDetail || loadingDetail;

  return (
    <div className="main-page">
      <div className="main-page-content">
        <section className="main-mapPanel" aria-label="축제 부스 지도">
          <div className="main-mapFrame">
            <div className="main-mapInner">
              <SvgImg src={OpenStageSvg} alt="야외공연장" className="main-buildingSvg main-buildingSvg--openStage" />
              <SvgImg src={StudentHallSvg} alt="학생회관" className="main-buildingSvg main-buildingSvg--studentHall" />
              <SvgImg src={ArchHallSvg} alt="건축관" className="main-buildingSvg main-buildingSvg--archHall" />

              {BOOTHS.map((booth) => (
                <MapIconButton
                  key={booth.key}
                  className={`${booth.posClass} ${booth.key === "booth-10" ? "is-booth10" : ""}`}
                  label={booth.label}
                  active={selectedKey === booth.key}
                  onClick={() => onClickBooth(booth)}
                >
                  <SvgImg src={booth.svg} alt="" className="main-mapIconSvg main-mapIconSvg--booth" />
                </MapIconButton>
              ))}

              {EXTRA_BOOTHS.map((booth) => (
                <MapIconButton
                  key={booth.key}
                  className={booth.posClass}
                  label={booth.label}
                  active={selectedKey === booth.key}
                  onClick={() => onClickBooth(booth)}
                >
                  <SvgImg src={booth.svg} alt="" className="main-mapIconSvg main-mapIconSvg--booth" />
                </MapIconButton>
              ))}

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

        <section className="main-clubCard" aria-label="선택한 동아리 정보" aria-busy={loadingDetail}>
          <div className="main-clubCard__head">
            <div className="main-clubCard__title">{loadingDetail ? "불러오는 중..." : cardName}</div>
            <div className="main-clubCard__tag">{cardCategory}</div>
          </div>

          {showClickPrompt && (
            <div className="main-clubCard__messageWrap">
              <p className="main-clubCard__message">부스를 클릭해보세요.</p>
            </div>
          )}

          {showNoInfo && (
            <div className="main-clubCard__messageWrap">
              <p className="main-clubCard__message">부스 정보가 없습니다.</p>
            </div>
          )}

          {showImages && (
            <div className="main-clubCard__images">
              {cardImages.map((url, i) => (
                <div className="main-clubCard__imgWrap" key={i}>
                  {url ? (
                    <img
                      className={`main-clubCard__img ${isSvgUrl(url) ? "is-svg" : ""}`}
                      src={url}
                      alt={`${cardName} 이미지 ${i + 1}`}
                    />
                  ) : (
                    <div className="main-clubCard__imgPlaceholder" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}