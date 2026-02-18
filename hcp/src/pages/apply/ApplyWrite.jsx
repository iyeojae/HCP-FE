// src/pages/apply/ApplyWrite.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ApplyForm from "./ApplyForm";

const normalizeTag = (s) => String(s || "").replace(/\s+/g, "");
const digitsOnly = (s) => String(s || "").replace(/[^\d]/g, "");

function buildContact(input) {
  // ✅ 요구사항: 010은 써져있고 뒤만 입력 → 최종은 010-1234-5678 형태
  const d = digitsOnly(input);
  // 사용자가 "12345678"만 넣는다고 가정(혹은 전체 넣어도 처리)
  if (d.startsWith("010") && d.length >= 10) {
    const rest = d.slice(3);
    const a = rest.slice(0, 4);
    const b = rest.slice(4, 8);
    return `010-${a}-${b}`;
  }
  const rest = d.slice(0, 8);
  const a = rest.slice(0, 4);
  const b = rest.slice(4, 8);
  return b ? `010-${a}-${b}` : `010-${a}`;
}

export default function ApplyWrite() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    studentNo: "",
    name: "",
    department: "",
    contact: "010-",
    applyPart: "",
    techTags: [], // ✅ UI 라벨 저장(띄어쓰기 포함 가능)
    motivation: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onChange = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const canSubmit = useMemo(() => {
    return (
      form.name.trim() &&
      form.department.trim() &&
      digitsOnly(form.contact).length >= 11 && // 010 포함 11자리(010 + 8)
      form.studentNo.trim() &&
      form.techTags.length >= 3 &&
      form.applyPart.trim() &&
      form.motivation.trim()
    );
  }, [form]);

  const onSubmit = async () => {
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);
      setErrorMsg("");

      // ✅ techStack: 띄어쓰기 있는 분야는 공백 제거 후 전송
      const techStack = (form.techTags || []).map(normalizeTag).join(", ");

      const payload = {
        studentNo: form.studentNo.trim(),
        name: form.name.trim(),
        department: form.department.trim(),
        contact: buildContact(form.contact),
        applyPart: form.applyPart,
        techStack,
        motivation: form.motivation.trim(),
      };

      await api.post("/common/applications", payload);

      // 성공 후 이동(원하는 흐름에 맞게 수정 가능)
      navigate("/clubs", { replace: true });
    } catch (e) {
      setErrorMsg(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "지원에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ApplyForm
      mode="write"
      value={form}
      onChange={onChange}
      loading={submitting}
      errorMsg={errorMsg}
      onSubmit={onSubmit}
    />
  );
}
