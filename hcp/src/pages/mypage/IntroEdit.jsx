// src/pages/mypage/IntroEdit.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "../../styles/mypage/IntroEdit.css";

const CATEGORIES = [
  { value: "PERFORMANCE", label: "공연" },
  { value: "SPORTS", label: "체육" },
  { value: "ACADEMIC", label: "학습" },
  { value: "VOLUNTEER", label: "봉사" },
  { value: "ART", label: "예술" },
  { value: "HOBBY", label: "취미" },
  { value: "RELIGION", label: "종교" },
];

const initForm = {
  name: "",
  summary: "",
  recruitStartAt: "",
  recruitEndAt: "",
  category: "RELIGION",
  introduction: "",
  interviewProcess: "",
  everytimeUrl: "",
};

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const norm = (s) => String(s || "").replace(/\s/g, "").toLowerCase();

// ✅ baseURL에 /api가 붙어있으면 제거 후 origin 만들기
const getApiOrigin = () => {
  const base =
    api?.defaults?.baseURL ||
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    "";
  if (!base) return window.location.origin;
  return String(base).replace(/\/api\/?$/i, "");
};

const toImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const origin = getApiOrigin();
  const p = String(path).startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
};

// ✅ 링크 정리(프로토콜 없으면 https:// 붙이기)
const normalizeLink = (raw) => {
  const s = String(raw || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
};

export default function IntroEdit() {
  const [mode, setMode] = useState("CREATE"); // CREATE | EDIT
  const [clubId, setClubId] = useState("");
  const clubIdNum = useMemo(() => toNum(clubId), [clubId]);

  const [form, setForm] = useState(initForm);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const setField = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
  };

  const resetAll = () => {
    setForm(initForm);
    setClubId("");
    setFile(null);
    setExistingImageUrl("");
    setMsg("");
  };

  const validate = () => {
    if (!form.name.trim()) return "동아리 이름을 입력하세요.";
    if (!form.summary.trim()) return "한 줄 소개를 입력하세요.";
    if (!form.category) return "카테고리를 선택하세요.";

    if (form.everytimeUrl.trim()) {
      const url = normalizeLink(form.everytimeUrl);
      if (!/^https?:\/\/.+/i.test(url)) return "대표 링크 형식이 올바르지 않습니다.";
    }
    return "";
  };

  const payload = useMemo(
    () => ({
      name: form.name.trim(),
      summary: form.summary.trim(),
      recruitStartAt: form.recruitStartAt ? form.recruitStartAt : null,
      recruitEndAt: form.recruitEndAt ? form.recruitEndAt : null,
      category: form.category,
      introduction: form.introduction,
      interviewProcess: form.interviewProcess,
      everytimeUrl: form.everytimeUrl.trim() ? normalizeLink(form.everytimeUrl) : null,
    }),
    [form]
  );

  const fillFromData = (data) => {
    const link =
      data?.everytimeUrl ??
      data?.applyLink ??
      data?.applyUrl ??
      data?.applyFormUrl ??
      data?.recruitLink ??
      "";

    setForm((p) => ({
      ...p,
      name: data?.name ?? p.name,
      summary: data?.summary ?? p.summary,
      category: data?.category ?? p.category,
      introduction: data?.introduction ?? p.introduction,
      interviewProcess: data?.interviewProcess ?? p.interviewProcess,
      recruitStartAt: data?.recruitStartAt ?? p.recruitStartAt,
      recruitEndAt: data?.recruitEndAt ?? p.recruitEndAt,
      everytimeUrl: link ? String(link) : p.everytimeUrl,
    }));

    // ✅ 이미지 URL 안정화( /api 제거한 origin 사용 )
    const img = toImageUrl(data?.mainImageUrl);
    setExistingImageUrl(img || "");
  };

  // ✅ 동아리명으로 clubId 찾기: GET /common/clubs?q=...
  const findClubIdByName = async (name) => {
    const q = String(name || "").trim();
    if (!q) return null;

    const res = await api.get("/api/common/clubs", { params: { q } });
    const groups = Array.isArray(res?.data) ? res.data : [];
    const flat = groups.flatMap((g) => (g?.clubs || []).map((c) => c));

    const exact = flat.find((c) => norm(c?.name) === norm(q));
    if (exact?.clubId) return exact.clubId;

    const partial = flat.find((c) => norm(c?.name).includes(norm(q)));
    if (partial?.clubId) return partial.clubId;

    return null;
  };

  const loadClubDetail = async (id) => {
    const res = await api.get(`/api/common/clubs/${id}`);
    return res?.data;
  };

  const loadForEdit = async () => {
    try {
      setBusy(true);
      setMsg("");

      let id = clubIdNum;

      if (!id) {
        id = await findClubIdByName(form.name);
        if (!id) {
          setMsg("해당 이름의 동아리를 찾지 못했습니다. (동아리명을 정확히 입력)");
          return;
        }
        setClubId(String(id));
      }

      const data = await loadClubDetail(id);
      if (!data) {
        setMsg("동아리 상세 정보를 불러오지 못했습니다.");
        return;
      }

      fillFromData(data);
      setMsg(`✅ 불러오기 완료 (clubId=${id})`);
    } catch (e) {
      setMsg(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "불러오기 실패"
      );
    } finally {
      setBusy(false);
    }
  };

  const createPost = async () => {
    const v = validate();
    if (v) return setMsg(v);

    try {
      setBusy(true);
      setMsg("");

      const res = await api.post("/api/clubadmin/clubs", payload);
      const id = res?.data?.clubId ?? res?.data?.data?.clubId ?? res?.data?.result?.clubId;

      if (id === undefined || id === null) {
        setMsg("생성은 되었지만 clubId 응답을 확인하지 못했습니다.");
        return;
      }

      setClubId(String(id));
      setMsg(`✅ 생성 완료! clubId=${id} (이제 대표 이미지 업로드 가능)`);
    } catch (e) {
      setMsg(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "생성 실패"
      );
    } finally {
      setBusy(false);
    }
  };

  const updatePost = async () => {
    const v = validate();
    if (v) return setMsg(v);
    if (!clubIdNum) return setMsg("수정할 clubId를 입력(또는 불러오기) 하세요.");

    try {
      setBusy(true);
      setMsg("");

      await api.put(`/api/clubadmin/clubs/${clubIdNum}`, payload);
      setMsg(`✅ 수정 완료! clubId=${clubIdNum}`);
    } catch (e) {
      setMsg(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "수정 실패"
      );
    } finally {
      setBusy(false);
    }
  };

  // ✅ 생성/수정 모두 동일 엔드포인트로 업로드 + 업로드 후 즉시 재조회로 화면 갱신
  const uploadMainImage = async (id) => {
    if (!id) return setMsg("clubId를 입력(또는 생성/불러오기) 하세요.");
    if (!file) return setMsg("업로드할 대표 이미지를 선택하세요.");

    try {
      setBusy(true);
      setMsg("");

      const fd = new FormData();
      fd.append("mainImage", file);

      await api.put("/api/clubadmin/clubs/main-image", fd, {
        params: { clubId: id },
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ 업로드 성공 후 최신 상세 재조회 → 기존 이미지 URL 갱신
      const data = await loadClubDetail(id);
      if (data) fillFromData(data);

      setFile(null);
      setPreview("");
      setMsg(`✅ 대표 이미지 반영 완료! clubId=${id}`);
    } catch (e) {
      setMsg(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "대표 이미지 업로드 실패"
      );
    } finally {
      setBusy(false);
    }
  };

  const uploadImageCreate = async () => uploadMainImage(clubIdNum);
  const uploadImageEdit = async () => uploadMainImage(clubIdNum);

  const onNameKeyDown = (e) => {
    if (mode !== "EDIT") return;
    if (e.key === "Enter") {
      e.preventDefault();
      loadForEdit();
    }
  };

  return (
    <div className="introEdit">
      <div className="introEdit__top">
        <div className="introEdit__title">동아리 글 관리</div>

        <div className="introEdit__seg">
          <button
            type="button"
            className={`introEdit__segBtn ${mode === "CREATE" ? "active" : ""}`}
            onClick={() => {
              setMode("CREATE");
              setMsg("");
            }}
          >
            생성
          </button>
          <button
            type="button"
            className={`introEdit__segBtn ${mode === "EDIT" ? "active" : ""}`}
            onClick={() => {
              setMode("EDIT");
              setMsg("");
            }}
          >
            수정
          </button>
        </div>
      </div>

      <div className="introEdit__card">
        <div className="introEdit__row">
          <label className="introEdit__label">clubId</label>
          <input
            className="introEdit__input"
            value={clubId}
            onChange={(e) => setClubId(e.target.value)}
            placeholder={
              mode === "CREATE"
                ? "생성 후 자동으로 채워짐"
                : "비워도 됨(이름으로 불러오기 가능)"
            }
            inputMode="numeric"
          />
        </div>

        <div className="introEdit__grid">
          <div className="introEdit__row">
            <label className="introEdit__label">
              동아리 이름 {mode === "EDIT" ? "(불러오기 기준)" : ""}
            </label>
            <input
              className="introEdit__input"
              value={form.name}
              onChange={setField("name")}
              onKeyDown={onNameKeyDown}
              placeholder="예) 멋쟁이 사자처럼"
            />
            {mode === "EDIT" ? (
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button
                  type="button"
                  className="introEdit__btn"
                  onClick={loadForEdit}
                  disabled={busy || (!clubIdNum && !form.name.trim())}
                >
                  기존 정보 불러오기
                </button>
              </div>
            ) : null}
          </div>

          <div className="introEdit__row">
            <label className="introEdit__label">한 줄 소개</label>
            <input
              className="introEdit__input"
              value={form.summary}
              onChange={setField("summary")}
              placeholder="예) 안녕하세요 아기사자 모집중입니다!"
            />
          </div>

          <div className="introEdit__row">
            <label className="introEdit__label">대표 링크(에브리타임)</label>
            <input
              className="introEdit__input"
              value={form.everytimeUrl}
              onChange={setField("everytimeUrl")}
              placeholder="예) https://everytime.kr/xxxxx (없으면 비워두기)"
              inputMode="url"
              autoComplete="off"
            />
          </div>

          <div className="introEdit__row">
            <label className="introEdit__label">모집 시작일</label>
            <input
              className="introEdit__input"
              type="date"
              value={form.recruitStartAt}
              onChange={setField("recruitStartAt")}
            />
          </div>

          <div className="introEdit__row">
            <label className="introEdit__label">모집 마감일</label>
            <input
              className="introEdit__input"
              type="date"
              value={form.recruitEndAt}
              onChange={setField("recruitEndAt")}
            />
          </div>

          <div className="introEdit__row">
            <label className="introEdit__label">카테고리</label>
            <select
              className="introEdit__input"
              value={form.category}
              onChange={setField("category")}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="introEdit__row">
          <label className="introEdit__label">소개글(본문)</label>
          <textarea
            className="introEdit__textarea"
            value={form.introduction}
            onChange={setField("introduction")}
            placeholder="동아리 소개를 입력하세요."
            rows={6}
          />
        </div>

        <div className="introEdit__row">
          <label className="introEdit__label">모집 절차</label>
          <textarea
            className="introEdit__textarea"
            value={form.interviewProcess}
            onChange={setField("interviewProcess")}
            placeholder="예) 서류 → 면접 → 합격"
            rows={4}
          />
        </div>

        <div className="introEdit__btns">
          {mode === "CREATE" ? (
            <button className="introEdit__btn" onClick={createPost} disabled={busy}>
              글 생성
            </button>
          ) : (
            <button className="introEdit__btn" onClick={updatePost} disabled={busy}>
              글 수정 저장
            </button>
          )}

          <button
            className="introEdit__btn introEdit__btn--ghost"
            onClick={resetAll}
            disabled={busy}
          >
            초기화
          </button>
        </div>

        <div className="introEdit__divider" />

        <div className="introEdit__row">
          <label className="introEdit__label">대표 이미지</label>

          <div className="introEdit__imgRow">
            <input
              className="introEdit__file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={busy}
            />

            {preview ? (
              <img className="introEdit__preview" src={preview} alt="선택한 이미지 미리보기" />
            ) : existingImageUrl ? (
              <img className="introEdit__preview" src={existingImageUrl} alt="현재 대표 이미지" />
            ) : (
              <div className="introEdit__preview introEdit__preview--empty">미리보기 없음</div>
            )}
          </div>
        </div>

        <div className="introEdit__btns">
          {mode === "CREATE" ? (
            <button
              className="introEdit__btn"
              onClick={uploadImageCreate}
              disabled={busy || !clubIdNum || !file}
            >
              대표 이미지 업로드
            </button>
          ) : (
            <button
              className="introEdit__btn"
              onClick={uploadImageEdit}
              disabled={busy || !clubIdNum || !file}
            >
              대표 이미지 교체
            </button>
          )}
        </div>

        {msg ? <div className="introEdit__msg">{msg}</div> : null}
      </div>
    </div>
  );
}