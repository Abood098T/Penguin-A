"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { saveToken, getToken, clearToken } from "@/lib/token";

export default function SettingsPage() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    setValue(getToken());
  }, []);

  function handleSave() {
    if (!value.trim()) return;
    saveToken(value);
    setSavedMsg(true);
    setTimeout(() => router.push("/explore"), 600);
  }

  function handleClear() {
    clearToken();
    setValue("");
  }

  return (
    <>
      <Topbar />
      <div className="token-box">
        <h2>Access Token تبع ميتا</h2>
        <p className="hint">
          هاد التوكن بينحفظ بمتصفحك بس (localStorage) — ما بينبعث ولا بينخزن
          عند أي سيرفر وسيط. كل طلب بيروح مباشرة من جهازك لسيرفرات ميتا.
        </p>
        <input
          type="password"
          placeholder="EAAxxxxxxxxxxxxxxxx"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSave}>حفظ ومتابعة</button>
          <button className="secondary" onClick={handleClear}>مسح</button>
        </div>
        {savedMsg && <p className="hint" style={{ color: "var(--accent)" }}>تم الحفظ ✓</p>}
      </div>
    </>
  );
}
