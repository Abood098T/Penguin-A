// اتصال مباشر من المتصفح لسيرفرات ميتا (graph.facebook.com).
// ما في أي وسيط بيننا وبين ميتا — الطلب بيروح مباشرة من جهاز المستخدم.

const GRAPH_VERSION = "v20.0";
const BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}/ads_archive`;

const FIELDS = [
  "id",
  "ad_creative_bodies",
  "ad_creative_link_titles",
  "ad_creative_link_captions",
  "ad_snapshot_url",
  "page_name",
  "page_id",
  "publisher_platforms",
  "ad_delivery_start_time",
  "ad_delivery_stop_time",
  "impressions",
  "spend",
].join(",");

/**
 * @param {object} params
 * @param {string} params.token - Meta Access Token (من متصفح المستخدم فقط)
 * @param {string} params.searchTerm - كلمة البحث
 * @param {string} params.country - كود دولة مثل "US" أو "JO"
 * @param {string} [params.after] - مؤشر الصفحة التالية (pagination cursor)
 * @param {string} [params.activeStatus] - ACTIVE | INACTIVE | ALL (فلتر رسمي من ميتا)
 * @param {number} [params.limit] - عدد النتائج بالصفحة الواحدة
 * @param {string} [params.adType] - ALL | POLITICAL_AND_ISSUE_ADS | EMPLOYMENT_ADS | HOUSING_ADS | CREDIT_ADS
 * @param {string} [params.dateMin] - تاريخ بداية بصيغة YYYY-MM-DD
 * @param {string} [params.dateMax] - تاريخ نهاية بصيغة YYYY-MM-DD
 */
export async function searchAds({
  token,
  searchTerm,
  country,
  after,
  activeStatus,
  limit,
  adType,
  dateMin,
  dateMax,
}) {
  if (!token) throw new Error("NO_TOKEN");

  const url = new URL(BASE_URL);
  url.searchParams.set("access_token", token);
  // ملاحظة: إذا كانت searchTerm فاضية، بترجع ميتا مجموعة واسعة من كل الإعلانات
  // المتاحة بالدولة المحددة (مش مقتصرة على كلمة بحث معينة).
  url.searchParams.set("search_terms", searchTerm ?? "");
  url.searchParams.set("ad_reached_countries", JSON.stringify([country || "US"]));
  url.searchParams.set("ad_type", adType || "ALL");
  url.searchParams.set("ad_active_status", activeStatus || "ALL");
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("limit", String(limit || 24));
  if (after) url.searchParams.set("after", after);
  if (dateMin) url.searchParams.set("ad_delivery_date_min", dateMin);
  if (dateMax) url.searchParams.set("ad_delivery_date_max", dateMax);

  const res = await fetch(url.toString());
  const json = await res.json();

  if (json.error) {
    const err = new Error(json.error.message || "META_API_ERROR");
    err.code = json.error.code;
    err.raw = json.error;
    err.friendlyMessage = friendlyError(json.error);
    throw err;
  }

  return {
    ads: json.data || [],
    nextCursor: json.paging?.cursors?.after || null,
    hasNext: Boolean(json.paging?.next),
  };
}

function friendlyError(error) {
  const code = error?.code;
  const sub = error?.error_subcode;
  if (code === 190) return "التوكن غير صالح أو منتهي الصلاحية. روح لصفحة الإعدادات وحدّثه.";
  if (code === 4 || code === 17) return "تجاوزت الحد المسموح من الطلبات لميتا مؤقتًا. جرّب بعد شوي.";
  if (code === 100 && sub === 33) return "الطلب غير صحيح — تأكد من صيغة الدولة أو التاريخ.";
  if (code === 100) return "بيانات الطلب غير مكتملة أو غير مدعومة. راجع الفلاتر المستخدمة.";
  return error?.message || "صار في خطأ أثناء الاتصال بميتا.";
}

// ميتا ما بتوفر فلترة حسب المنصة أو ترتيب حسب التاريخ كباراميتر رسمي بالـ API،
// فبنطبقهم محليًا بعد ما توصل البيانات (على الإعلانات المحمّلة حاليًا فقط).

export function filterByPlatform(ads, platform) {
  if (!platform || platform === "ALL") return ads;
  return ads.filter((ad) => (ad.publisher_platforms || []).includes(platform));
}

export function sortByDate(ads, order) {
  const sorted = [...ads].sort((a, b) => {
    if (order === "performance") {
      const la = computeLongevity(a)?.days || 0;
      const lb = computeLongevity(b)?.days || 0;
      return lb - la;
    }
    const da = new Date(a.ad_delivery_start_time || 0).getTime();
    const db = new Date(b.ad_delivery_start_time || 0).getTime();
    return order === "oldest" ? da - db : db - da;
  });
  return sorted;
}

/**
 * مؤشر أداء حقيقي مبني على بيانات ميتا الفعلية (مش رقم مخترع):
 * كل ما إعلان ضل شغّال فترة أطول (أو لسة نشط ومستمر)، هاد بيعتبر إشارة معروفة
 * بصناعة الإعلانات إنه بيحقق نتائج وبيستاهل الاستثمار فيه أكتر.
 * بنحسبها من ad_delivery_start_time و ad_delivery_stop_time.
 */
export function computeLongevity(ad) {
  const start = ad.ad_delivery_start_time ? new Date(ad.ad_delivery_start_time) : null;
  if (!start) return null;

  const end = ad.ad_delivery_stop_time ? new Date(ad.ad_delivery_stop_time) : new Date();
  const days = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  const isActive = !ad.ad_delivery_stop_time;

  let tier;
  if (days >= 30) tier = { label: "أداء قوي", emoji: "🔥", cls: "tier-strong" };
  else if (days >= 7) tier = { label: "أداء متوسط", emoji: "🟡", cls: "tier-mid" };
  else tier = { label: "جديد", emoji: "⚪", cls: "tier-new" };

  return { days, isActive, ...tier };
}
