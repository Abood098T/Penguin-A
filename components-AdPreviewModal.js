"use client";

export default function AdPreviewModal({ ad, onClose }) {
  if (!ad) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <strong>{ad.page_name || "معاينة الإعلان"}</strong>
          <button className="secondary" onClick={onClose}>إغلاق ✕</button>
        </div>
        {/* بنعرض صفحة المعاينة الرسمية تبع ميتا نفسها جوا إطار — مش نسخ أو استضافة للمحتوى */}
        <iframe
          src={ad.ad_snapshot_url}
          title="معاينة الإعلان من ميتا"
          className="modal-iframe"
        />
      </div>
    </div>
  );
}
