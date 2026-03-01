// src/pages/apply/ApplyRead.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import ApplyForm from "./ApplyForm";

const normalize = (s) => String(s || "").replace(/\s+/g, "").toLowerCase();

const splitTechStack = (s) =>
  String(s || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

/** ✅ 백엔드 tech 값을 "판단"해서 우리 칩 라벨로 매핑 */
function mapTechToCanonical(rawTech) {
  const arr = Array.isArray(rawTech) ? rawTech : splitTechStack(rawTech);
  const out = new Set();

  arr.forEach((t) => {
    const k = normalize(t);
    if (!k) return;

    // Google -> GCP
    if (k.includes("google") || k.includes("gcp") || k.includes("gcloud") || k.includes("googlecloud")) {
      out.add("GCP");
      return;
    }

    if (k.includes("aws") || k.includes("amazon")) {
      out.add("AWS");
      return;
    }

    if (k.includes("figma")) {
      out.add("Figma");
      return;
    }

    if (k === "c" || k.includes("c언어")) {
      out.add("C");
      return;
    }

    if (k.includes("python")) {
      out.add("Python");
      return;
    }

    if (k.includes("redis")) {
      out.add("Redis");
      return;
    }

    if (k === "ts" || k.includes("typescript")) {
      out.add("TS");
      return;
    }

    if (k === "js" || k.includes("javascript")) {
      out.add("JS");
      return;
    }

    if (k.includes("mysql")) {
      out.add("MySQL");
      return;
    }

    if (k.includes("git")) {
      out.add("Git");
      return;
    }

    // Spring/SpringBoot -> Java 로 판단
    if (k.includes("spring")) {
      out.add("Java");
      return;
    }

    if (k.includes("java")) {
      out.add("Java");
      return;
    }

    if (k.includes("adobe") || k.includes("illustrator") || k.includes("ai")) {
      out.add("Adobe Illustrator");
      return;
    }
  });

  return Array.from(out);
}

/** ✅ 지원파트도 백엔드 값이 다르면 판단해서 매핑 */
function mapPartToCanonical(rawPart) {
  const k = normalize(rawPart);
  if (!k) return "";

  if (k.includes("디자")) return "디자인";
  if (k.includes("백") || k.includes("backend")) return "백엔드";
  if (k.includes("프론트") || k.includes("front")) return "프론트 엔드";
  if (k.includes("미정") || k.includes("none") || k.includes("nochoice")) return "선택 미정";

  // 매칭 실패하면 원문 그대로
  return rawPart;
}

export default function ApplyRead() {
  const navigate = useNavigate();
  const location = useLocation();
  const { applicationId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!applicationId) {
      setErrorMsg("지원서 ID가 올바르지 않습니다.");
      return;
    }

    let alive = true;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await api.get(`/clubadmin/applications/${applicationId}`);
        if (!alive) return;

        setData(res?.data || null);
      } catch (e) {
        const status = e?.response?.status;

        if (status === 401 || status === 403) {
          if (!alive) return;
          navigate("/admin/login", { replace: true, state: { from: location } });
          return;
        }

        if (!alive) return;
        setErrorMsg(
          e?.response?.data?.message ||
            e?.response?.data?.error ||
            e?.message ||
            "지원서 정보를 불러오지 못했습니다."
        );
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      alive = false;
    };
  }, [applicationId, navigate, location]);

  const value = useMemo(() => {
    if (!data) {
      return {
        studentNo: "",
        name: "",
        department: "",
        contact: "",
        applyPart: "",
        techTags: [],      // ✅ read에서도 techTags를 사용 (칩 활성화)
        techStack: "",     // ✅ 빈 값일 땐 "" (괄호 같은 표시 원천 차단)
        motivation: "",
      };
    }

    const mappedTech = mapTechToCanonical(data.techStack);
    const mappedPart = mapPartToCanonical(data.applyPart);

    return {
      studentNo: data.studentNo || "",
      name: data.name || "",
      department: data.department || "",
      contact: data.contact || "",
      applyPart: mappedPart || "",
      techTags: mappedTech,             // ✅ 우리가 판단한 값으로 "불" 켬
      techStack: mappedTech.length ? mappedTech.join(", ") : "", // ✅ 빈 배열이면 "" (괄호 X)
      motivation: data.motivation || "",
    };
  }, [data]);

  return (
    <ApplyForm
      mode="read"
      value={value}
      onChange={() => {}}
      loading={loading}
      errorMsg={errorMsg}
      onClose={() => navigate("/mypage/applicants")}
    />
  );
}