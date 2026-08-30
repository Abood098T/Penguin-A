"use client";
import Link from "next/link";

export default function Topbar() {
  return (
    <div className="topbar">
      <div className="brand">
        مستكشف<span> ميتا</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <Link href="/explore" className="nav-link">استكشاف</Link>
        <Link href="/brand-spy" className="nav-link">تجسّس براند</Link>
        <Link href="/folders" className="nav-link">المجلدات</Link>
        <Link href="/settings" className="nav-link">التوكن</Link>
      </div>
    </div>
  );
}
