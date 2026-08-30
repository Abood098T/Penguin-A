"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import AdCard from "@/components/AdCard";
import AdPreviewModal from "@/components/AdPreviewModal";
import { getToken, hasToken } from "@/lib/token";
import { searchAds, sortByDate } from "@/lib/metaAdLibrary";

function BrandSpyInner() {
  const router = useRouter();
  const [pageQuery, setPageQuery] = useState("");
  const [country, setCountry] = useState("US");
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewAd, setPreviewAd] = useState(null);
  const [searchedFor, setSearchedFor] = useState("");

  useEffect(() => {
    if (!hasToken()) router.replace("/settings");
  }, [router]);

  async function runBrandSearch() {
    if (!pageQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      // بحث ميتا بالكلمة كـ search_terms بيرجع إعلانات مرتبطة باسم الصفحة/البراند
      const result = await searchAds({
        token,
        searchTerm: pageQuery,
        country,
        activeStatus: "ALL",
        limit: 48,
      });
      // فلترة إضافية محليًا: بس الإعلانات يلي اسم الصفحة فيها قريب من كلمة البحث
      const q = pageQuery.trim().toLowerCase();
      const narrowed = result.ads.filter((ad) =>
        (ad.page_name || "").toLowerCase().includes(q)
      );
      setAds(sortByDate(narrowed.length ? narrowed : result.ads, "newest"));
      setSearchedFor(pageQuery);
    } catch (e) {
      setError(e.raw?.message || "تعذّر الاتصال بميتا. تأكد من التوكن.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar />
      <div className="container">
        <h2 style={{ marginTop: 0 }}>تجسّس على براند (Brand Spy)</h2>
        <p className="hint" style={{ marginBottom: 18 }}>
          اكتب اسم صفحة أو براند على فيسبوك/انستقرام لعرض كل إعلاناته النشطة والسابقة.
        </p>

        <div className="search-row">
          <input
            style={{ flex: 1, minWidth: 220 }}
            value={pageQuery}
            onChange={(e) => setPageQuery(e.target.value)}
            placeholder="اسم البراند أو الصفحة بالضبط..."
            onKeyDown={(e) => e.key === "Enter" && runBrandSearch()}
          />
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="US">أمريكا</option>
            <option value="JO">الأردن</option>
            <option value="SA">السعودية</option>
            <option value="AE">الإمارات</option>
            <option value="EG">مصر</option>
            <option value="GB">بريطانيا</option>
          </select>
          <button onClick={runBrandSearch} disabled={loading}>
            {loading ? "جارِ البحث..." : "تجسّس"}
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        {!error && searchedFor && (
          <p className="hint" style={{ marginBottom: 14 }}>
            {ads.length} إعلان لـ «{searchedFor}»
          </p>
        )}

        <div className="grid">
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} onPreview={setPreviewAd} />
          ))}
        </div>

        {!loading && searchedFor && ads.length === 0 && !error && (
          <div className="empty-state">ما لقينا إعلانات لهاد البراند بهاي الدولة.</div>
        )}
      </div>

      <AdPreviewModal ad={previewAd} onClose={() => setPreviewAd(null)} />
    </>
  );
}

export default function BrandSpyPage() {
  return (
    <Suspense fallback={null}>
      <BrandSpyInner />
    </Suspense>
  );
}
