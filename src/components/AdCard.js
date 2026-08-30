"use client";
import { useState } from "react";
import SaveToFolderButton from "./SaveToFolderButton";
import { computeLongevity } from "@/lib/metaAdLibrary";

export default function AdCard({ ad, onPreview, view = "grid" }) {
  const [copied, setCopied] = useState(false);
  const bodyText = ad.ad_creative_bodies?.[0] || "لا يوجد نص معاينة لهذا الإعلان";
  const initial = (ad.page_name || "?").charAt(0);
  const longevity = computeLongevity(ad);

  function handleCopy() {
    navigator.clipboard?.writeText(bodyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className={`card ${view === "list" ? "card-list" : ""}`}>
      <div className="card-head">
        <div className="avatar">{initial}</div>
        <div>
          <div className="page-name">{ad.page_name || "صفحة غير معروفة"}</div>
          <div className="platforms">
            {(ad.publisher_platforms || []).join(" · ") || "—"}
          </div>
        </div>
        {longevity && (
          <span className={`perf-badge ${longevity.cls}`} title="مبني على مدة عرض الإعلان الفعلية من ميتا">
            {longevity.emoji} {longevity.label}
          </span>
        )}
      </div>

      <div className="card-body">
        <p className="creative-text">{bodyText}</p>
        <div className="badge-row">
          {ad.ad_delivery_start_time && (
            <span className="badge">يعمل منذ {ad.ad_delivery_start_time}</span>
          )}
          {longevity && (
            <span className="badge">
              {longevity.isActive ? `نشط منذ ${longevity.days} يوم` : `اشتغل ${longevity.days} يوم`}
            </span>
          )}
        </div>
      </div>

      <div className="card-foot">
        <button className="secondary" onClick={() => onPreview?.(ad)}>
          معاينة سريعة
        </button>
        <button className="secondary" onClick={handleCopy}>
          {copied ? "تم النسخ ✓" : "نسخ النص"}
        </button>
        <a href={ad.ad_snapshot_url} target="_blank" rel="noreferrer">
          فتح بميتا
        </a>
        <SaveToFolderButton ad={ad} />
      </div>
    </div>
  );
}
