// src/pages/apply/ApplyRead.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import ApplyForm from "./ApplyForm";

export default function ApplyRead() {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await api.get(`/clubadmin/applications/${applicationId}`);
        setData(res?.data || null);
      } catch (e) {
        setErrorMsg(
          e?.response?.data?.message ||
            e?.response?.data?.error ||
            e?.message ||
            "지원서 정보를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [applicationId]);

  // ✅ ApplyForm은 value.techStack 문자열을 인식해서 칩 활성화 처리함
  const value = data
    ? {
        studentNo: data.studentNo || "",
        name: data.name || "",
        department: data.department || "",
        contact: data.contact || "",
        applyPart: data.applyPart || "",
        techStack: data.techStack || "",
        motivation: data.motivation || "",
      }
    : {
        studentNo: "",
        name: "",
        department: "",
        contact: "",
        applyPart: "",
        techStack: "",
        motivation: "",
      };

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
