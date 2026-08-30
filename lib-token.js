// هاد الملف بيدير الـ Access Token تبع Meta بشكل محلي بالكامل داخل متصفح المستخدم.
// التوكن ما بينخزن ولا بينبعث لأي سيرفر إلا سيرفرات ميتا نفسها وقت تنفيذ الطلب.
// ما في backend وسيط بيشوف أو يحفظ هاد التوكن.

const STORAGE_KEY = "meta_ad_library_token";

export function saveToken(token) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, token.trim());
}

export function getToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEY) || "";
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function hasToken() {
  return Boolean(getToken());
}
