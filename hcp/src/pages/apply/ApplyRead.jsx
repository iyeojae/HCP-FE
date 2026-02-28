// src/pages/apply/ApplyRead.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import ApplyForm from "./ApplyForm";

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

        // ✅ 권한/인증 문제면 관리자 로그인으로
        if (status === 401 || status === 403) {
          if (!alive) return;
          navigate("/admin/login", {
            replace: true,
            state: { from: location },
          });
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

  // ✅ ApplyForm은 value.techStack 문자열을 인식해서 칩 활성화 처리함
  const value = useMemo(() => {
    if (!data) {
      return {
        studentNo: "",
        name: "",
        department: "",
        contact: "",
        applyPart: "",
        techStack: "",
        motivation: "",
      };
    }

    return {
      studentNo: data.studentNo || "",
      name: data.name || "",
      department: data.department || "",
      contact: data.contact || "",
      applyPart: data.applyPart || "",
      techStack: data.techStack || "",
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