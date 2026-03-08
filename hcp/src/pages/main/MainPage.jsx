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

/** ✅ 총동아리연합회용 직접 등록 이미지 */
import UnionBoothJpg from "../../assets/main/booths/union_booth.jpg";

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
  const d = raw?.data ?? raw?.result ?? raw;
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
    isCustom: false,
    customTag: "",
  };
}

// ✅ D-day 자연어 표시 (OPEN일 때만 사용)
const ddayText = (v) => {
  if (v === null || v === undefined) return "-";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);

  if (n > 0) return `${n}일 남음`;
  if (n === 0) return "오늘 마감";
  return "지원 마감";
};

// ✅ recruitState 규칙 반영 (백엔드 계산값은 "표시"만)
const formatDeadlineByState = (recruitState, daysLeft) => {
  const s = String(recruitState || "").toUpperCase();

  if (s === "PRE") return "모집 전";
  if (s === "CLOSED") return "모집 종료";

  // OPEN(또는 기타)일 때만 D-day 표기
  return ddayText(daysLeft);
};

// ✅ "상세소개"는 소개글 없는 것으로 취급 (공백 포함 변형 방어)
const isPlaceholderIntro = (s) => String(s || "").replace(/\s/g, "") === "상세소개";

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
   * ✅ clubId 매핑
   * booth-10 은 API 연동 안 하므로 null 유지
   */
  const CLUB_ID_MAP = useMemo(
    () => ({
      "booth-1": 22, // 정음
      "booth-2": 36, // ccc
      "booth-3": 20, // 무혼
      "booth-4": 15, // 라온
      "booth-5": 23, // 크라이시스
      "booth-6": 26, // 히바
      "booth-7": 10, // 투메니엠씨
      "booth-8": 41, // 다원
      "booth-9": 34, // 시골풍경
      "booth-10": null, // 총동아리연합회 (직접 데이터 사용)

      "booth9-sub-1": 40, // 나비
      "truckArea-booth-1": 13, // 한서랑붓다랑
      "truckArea-booth-2": 16, // 비상
      "truckArea-booth-3": 14, // 무브
    }),
    []
  );

  /**
   * ✅ booth-10 전용 직접 데이터
   */
  const CUSTOM_BOOTH_DETAIL_MAP = useMemo(
    () => ({
      "booth-10": {
        clubId: null,
        mainImageUrl: UnionBoothJpg,
        name: "총동아리연합회",
        summary: "",
        recruitState: null,
        daysLeftToRecruitEnd: null,
        viewCount: null,
        category: "",
        customTag: "운영",
        introduction:
          "총동아리연합회 부스입니다. 축제 기간 동안 동아리 관련 안내와 행사 운영 지원을 진행하며, 방문 학생들에게 필요한 정보를 제공하는 공간입니다.",
        interviewProcess: "",
        isCustom: true,
        hideDeadline: true,
      },
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

    /** ✅ 1) 직접 넣는 부스면 API 안 타고 바로 세팅 */
    const customDetail = CUSTOM_BOOTH_DETAIL_MAP[booth.key];
    if (customDetail) {
      setSelectedDetail(customDetail);
      setLoadingDetail(false);
      return;
    }

    /** ✅ 2) 일반 부스는 기존처럼 API 연동 */
    const clubId = CLUB_ID_MAP[booth.key];

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

  /** 헤더 */
  const clubName = selectedDetail?.name || "";
  const categoryCode = selectedDetail?.category || "";
  const categoryLabel =
    selectedDetail?.customTag || CATEGORY_LABEL[categoryCode] || categoryCode || "분야";

  /** 사진 */
  const imageUrl = selectedDetail?.isCustom
    ? selectedDetail?.mainImageUrl || ""
    : resolveAssetUrl(selectedDetail?.mainImageUrl);

  const hasImage = !!imageUrl;

  /** ✅ 소개글 ("상세소개"면 없음 처리) */
  const introText = useMemo(() => {
    const introRaw = String(selectedDetail?.introduction ?? "").trim();
    const summaryRaw = String(selectedDetail?.summary ?? "").trim();

    const intro = introRaw && !isPlaceholderIntro(introRaw) ? introRaw : "";
    const summary = summaryRaw && !isPlaceholderIntro(summaryRaw) ? summaryRaw : "";

    return intro || summary || "";
  }, [selectedDetail]);

  /** ✅ 마감기한: PRE/OPEN/CLOSED 규칙 적용 */
  const deadlineText = formatDeadlineByState(
    selectedDetail?.recruitState,
    selectedDetail?.daysLeftToRecruitEnd
  );
  const hideDeadline = !!selectedDetail?.hideDeadline;

  /** 오오라 */
  const glowKey = showLoaded ? selectedKey : null;

  /** 카드 클릭 시 상세 이동 가능 여부 */
  const canGoDetail = showLoaded && !!selectedDetail?.clubId && !selectedDetail?.isCustom;

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
                  <SvgImg
                    src={booth.svg}
                    alt=""
                    className="main-mapIconSvg main-mapIconSvg--booth"
                  />
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
                  <SvgImg
                    src={booth.svg}
                    alt=""
                    className="main-mapIconSvg main-mapIconSvg--booth"
                  />
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
                  <SvgImg
                    src={t.svg}
                    alt=""
                    className="main-mapIconSvg main-mapIconSvg--truck"
                  />
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

          {showLoaded && (
            <div className="main-clubCard__detailRow">
              {hasImage ? (
                <div className="main-clubCard__thumb">
                  <div className="main-clubCard__imgWrap">
                    <img
                      className={`main-clubCard__img ${isSvgUrl(imageUrl) ? "is-svg" : ""}`}
                      src={imageUrl}
                      alt={`${clubName} 사진`}
                    />
                  </div>
                </div>
              ) : (
                <div className="main-clubCard__noImageNote">등록된 사진이 없습니다.</div>
              )}

              <div className="main-clubCard__detailText">
                {!hideDeadline && (
                  <div className="main-clubCard__deadline">
                    <span className="main-clubCard__deadlineLabel">마감기한</span>
                    <span className="main-clubCard__deadlineVal">{deadlineText}</span>
                  </div>
                )}

                {introText ? (
                  <p className="main-clubCard__intro">{introText}</p>
                ) : (
                  <p className="main-clubCard__intro is-empty">소개글 없음</p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}