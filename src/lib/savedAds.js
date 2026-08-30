// حفظ الإعلانات المفضلة محليًا فقط بمتصفح المستخدم (localStorage).
// ما في أي رفع لبيانات المستخدم لأي سيرفر.

const KEY = "meta_ads_saved";

export function getSaved() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function isSaved(adId) {
  return getSaved().some((a) => a.id === adId);
}

export function toggleSaved(ad) {
  const current = getSaved();
  const exists = current.some((a) => a.id === ad.id);
  const next = exists
    ? current.filter((a) => a.id !== ad.id)
    : [...current, ad];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return !exists;
}
