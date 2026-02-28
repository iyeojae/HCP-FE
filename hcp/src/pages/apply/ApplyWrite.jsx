// src/pages/apply/ApplyWrite.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ApplyForm from "./ApplyForm";

const normalizeTag = (s) => String(s || "").replace(/\s+/g, "");
const digitsOnly = (s) => String(s || "").replace(/[^\d]/g, "");

/** 사용자가 어떤 형태로 입력하든 010-XXXX-XXXX 형태로 강제 */
function normalizeContactDisplay(input) {
  const d = digitsOnly(input);

  // 사용자가 010까지 포함해서 쳐도, 뒤 8자리만 쓰도록
  const rest = (d.startsWith("010") ? d.slice(3) : d).slice(0, 8);

  const a = rest.slice(0, 4);
  const b = rest.slice(4, 8);

  if (!a) return "010-";
  if (!b) return `010-${a}`;
  return `010-${a}-${b}`;
}

/** 서버 전송용: 완성된 010-1234-5678만 반환(미완성은 "") */
function buildContactForPayload(display) {
  const d = digitsOnly(display);
  const rest = (d.startsWith("010") ? d.slice(3) : d);
  if (rest.length !== 8) return "";
  return `010-${rest.slice(0, 4)}-${rest.slice(4, 8)}`;
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

  // ✅ ApplyForm에서 올라오는 patch를 여기서 정규화(특히 contact)
  const onChange = (patch) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };

      // 연락처는 항상 010-XXXX-XXXX 표시 유지
      if (Object.prototype.hasOwnProperty.call(patch, "contact")) {
        next.contact = normalizeContactDisplay(patch.contact);
      }

      // 학번은 숫자만(원하면 제거 가능)
      if (Object.prototype.hasOwnProperty.call(patch, "studentNo")) {
        next.studentNo = digitsOnly(patch.studentNo);
      }

      return next;
    });
  };

  const canSubmit = useMemo(() => {
    const contactPayload = buildContactForPayload(form.contact);

    return (
      form.name.trim() &&
      form.department.trim() &&
      !!contactPayload && // ✅ 010-1234-5678 완성 여부
      form.studentNo.trim() &&
      form.techTags.length >= 3 &&
      form.applyPart.trim() &&
      form.motivation.trim() &&
      !submitting
    );
  }, [form, submitting]);

  const onSubmit = async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      setErrorMsg("");

      // ✅ techStack: 띄어쓰기 있는 분야는 공백 제거 후 전송
      const techStack = (form.techTags || []).map(normalizeTag).join(", ");

      const payload = {
        studentNo: form.studentNo.trim(),
        name: form.name.trim(),
        department: form.department.trim(),
        contact: buildContactForPayload(form.contact), // ✅ 010-1234-5678
        applyPart: form.applyPart,
        techStack,
        motivation: form.motivation.trim(),
      };

      const res = await api.post("/common/applications", payload);
      // res.data: { applicationId: ... } 형태면 여기서도 사용 가능

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