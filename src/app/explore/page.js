"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import AdCard from "@/components/AdCard";
import AdPreviewModal from "@/components/AdPreviewModal";
import { getToken, hasToken } from "@/lib/token";
import { searchAds, filterByPlatform, sortByDate } from "@/lib/metaAdLibrary";
import { getRecentSearches, addRecentSearch } from "@/lib/recentSearches";

const COUNTRIES = [
  { code: "US", label: "أمريكا" },
  { code: "JO", label: "الأردن" },
  { code: "SA", label: "السعودية" },
  { code: "AE", label: "الإمارات" },
  { code: "EG", label: "مصر" },
  { code: "GB", label: "بريطانيا" },
];

const PLATFORMS = [
  { value: "ALL", label: "كل المنصات" },
  { value: "facebook", label: "فيسبوك" },
  { value: "instagram", label: "انستقرام" },
  { value: "messenger", label: "ماسنجر" },
  { value: "audience_network", label: "شبكة الجمهور" },
];

const STATUSES = [
  { value: "ALL", label: "كل الحالات" },
  { value: "ACTIVE", label: "نشط الآن" },
  { value: "INACTIVE", label: "متوقف" },
];

const SORTS = [
  { value: "newest", label: "الأحدث أولًا" },
  { value: "oldest", label: "الأقدم أولًا" },
  { value: "performance", label: "الأقوى أداءً (الأطول عمرًا)" },
];

const AD_TYPES = [
  { value: "ALL", label: "كل الأنواع" },
  { value: "POLITICAL_AND_ISSUE_ADS", label: "سياسية/قضايا عامة" },
  { value: "EMPLOYMENT_ADS", label: "وظائف" },
  { value: "HOUSING_ADS", label: "سكن" },
  { value: "CREDIT_ADS", label: "ائتمان/تمويل" },
];

const PAGE_SIZES = [12, 24, 48];

function ExploreInner() {
  const router = useRouter();

  const [term, setTerm] = useState("");
  const [country, setCountry] = useState("US");
  const [platform, setPlatform] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [pageSize, setPageSize] = useState(24);
  const [adType, setAdType] = useState("ALL");
  const [dateMin, setDateMin] = useState("");
  const [dateMax, setDateMax] = useState("");
  const [localFilter, setLocalFilter] = useState("");
  const [view, setView] = useState("grid");
  const [ads, setAds] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const [previewAd, setPreviewAd] = useState(null);
  const [recent, setRecent] = useState([]);
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  useEffect(() => {
    if (!hasToken()) {
      router.replace("/settings");
      return;
    }
    setReady(true);
  }, [router]);

  async function runSearch(reset = true) {
    setLoading(true);
    setError(null);
    setShowRecent(false);
    if (reset && term.trim()) {
      addRecentSearch(term);
      setRecent(getRecentSearches());
    }
    try {
      const token = getToken();
      const result = await searchAds({
        token,
        searchTerm: term,
        country,
        activeStatus: status,
        limit: pageSize,
        adType,
        dateMin: dateMin || undefined,
        dateMax: dateMax || undefined,
        after: reset ? undefined : cursor,
      });
      setAds((prev) => (reset ? result.ads : [...prev, ...result.ads]));
      setCursor(result.nextCursor);
      setHasNext(result.hasNext);
    } catch (e) {
      if (e.message === "NO_TOKEN") {
        router.replace("/settings");
        return;
      }
      setError(e.friendlyMessage || e.raw?.message || "صار في خطأ أثناء الاتصال بميتا. تأكد من صلاحية التوكن.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ready) runSearch(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const platformFiltered = filterByPlatform(ads, platform);
  const localFiltered = localFilter.trim()
    ? platformFiltered.filter((ad) => {
        const q = localFilter.trim().toLowerCase();
        const page = (ad.page_name || "").toLowerCase();
        const body = (ad.ad_creative_bodies?.[0] || "").toLowerCase();
        const title = (ad.ad_creative_link_titles?.[0] || "").toLowerCase();
        return page.includes(q) || body.includes(q) || title.includes(q);
      })
    : platformFiltered;
  const list = sortByDate(localFiltered, sort);

  return (
    <>
      <Topbar />
      <div className="container">
        <div className="search-row">
          <div className="search-with-suggestions">
            <input
              style={{ flex: 1, minWidth: 220 }}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onFocus={() => setShowRecent(true)}
              onBlur={() => setTimeout(() => setShowRecent(false), 150)}
              placeholder="اختياري: ابحث عن منتج، براند، أو كلمة مفتاحية... (اتركه فاضي لعرض كل الإعلانات)"
              onKeyDown={(e) => e.key === "Enter" && runSearch(true)}
            />
            {showRecent && recent.length > 0 && (
              <div className="recent-popover">
                <div className="hint" style={{ padding: "6px 10px" }}>عمليات بحث سابقة</div>
                {recent.map((r) => (
                  <div
                    key={r}
                    className="recent-item"
                    onMouseDown={() => {
                      setTerm(r);
                      setShowRecent(false);
                    }}
                  >
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>{n} بالصفحة</option>
            ))}
          </select>
          <button onClick={() => runSearch(true)} disabled={loading}>
            {loading ? "جارِ البحث..." : "بحث"}
          </button>
        </div>

        <div className="search-row">
          <span className="hint" style={{ alignSelf: "center" }}>المنصة:</span>
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              className={`secondary ${platform === p.value ? "active" : ""}`}
              onClick={() => setPlatform(p.value)}
            >
              {p.label}
            </button>
          ))}
          <span className="hint" style={{ alignSelf: "center", marginRight: 12 }}>الترتيب:</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            className={`secondary ${view === "grid" ? "active" : ""}`}
            onClick={() => setView("grid")}
          >
            شبكة
          </button>
          <button
            className={`secondary ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
          >
            قائمة
          </button>
        </div>

        <div className="search-row">
          <span className="hint" style={{ alignSelf: "center" }}>نوع الإعلان:</span>
          <select value={adType} onChange={(e) => setAdType(e.target.value)}>
            {AD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <span className="hint" style={{ alignSelf: "center", marginRight: 12 }}>من تاريخ:</span>
          <input type="date" value={dateMin} onChange={(e) => setDateMin(e.target.value)} />
          <span className="hint" style={{ alignSelf: "center" }}>إلى:</span>
          <input type="date" value={dateMax} onChange={(e) => setDateMax(e.target.value)} />
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="search-row">
          <input
            style={{ flex: 1, minWidth: 220 }}
            value={localFilter}
            onChange={(e) => setLocalFilter(e.target.value)}
            placeholder="🔎 فلترة فورية ضمن الإعلانات المعروضة (اسم الصفحة أو نص الإعلان)..."
          />
        </div>

        {!error && (
          <p className="hint" style={{ marginBottom: 14 }}>
            {list.length} إعلان معروض
            {platform !== "ALL" || status !== "ALL" || localFilter.trim() ? " (بعد الفلترة)" : ""}
          </p>
        )}

        {!error && list.length === 0 && !loading && (
          <div className="empty-state">ما في نتائج، جرّب كلمة بحث تانية أو دولة تانية.</div>
        )}

        <div className={view === "list" ? "list-view" : "grid"}>
          {list.map((ad) => (
            <AdCard key={ad.id} ad={ad} view={view} onPreview={setPreviewAd} />
          ))}
        </div>

        {hasNext && (
          <button className="secondary load-more" onClick={() => runSearch(false)} disabled={loading}>
            {loading ? "جارِ التحميل..." : "تحميل المزيد"}
          </button>
        )}
      </div>

      <AdPreviewModal ad={previewAd} onClose={() => setPreviewAd(null)} />
    </>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExploreInner />
    </Suspense>
  );
}
