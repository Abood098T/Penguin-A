// نظام المجلدات (Folders & Boards) — محلي بالكامل بمتصفح المستخدم.

const FOLDERS_KEY = "meta_ads_folders";

function readAll() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(FOLDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeAll(folders) {
  window.localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function getFolders() {
  const folders = readAll();
  if (folders.length === 0) {
    // مجلد افتراضي أول مرة
    const initial = [{ id: "default", name: "المجلد الافتراضي", adIds: [] }];
    writeAll(initial);
    return initial;
  }
  return folders;
}

export function createFolder(name) {
  const folders = getFolders();
  const folder = { id: `f_${Date.now()}`, name: name.trim(), adIds: [] };
  writeAll([...folders, folder]);
  return folder;
}

export function renameFolder(id, name) {
  const folders = getFolders().map((f) => (f.id === id ? { ...f, name } : f));
  writeAll(folders);
}

export function deleteFolder(id) {
  const folders = getFolders().filter((f) => f.id !== id);
  writeAll(folders);
}

export function addAdToFolder(folderId, ad) {
  const folders = getFolders().map((f) => {
    if (f.id !== folderId) return f;
    if (f.adIds.some((a) => a.id === ad.id)) return f;
    return { ...f, adIds: [...f.adIds, ad] };
  });
  writeAll(folders);
}

export function removeAdFromFolder(folderId, adId) {
  const folders = getFolders().map((f) =>
    f.id === folderId ? { ...f, adIds: f.adIds.filter((a) => a.id !== adId) } : f
  );
  writeAll(folders);
}

export function isAdInAnyFolder(adId) {
  return getFolders().some((f) => f.adIds.some((a) => a.id === adId));
}

export function getFoldersForAd(adId) {
  return getFolders().filter((f) => f.adIds.some((a) => a.id === adId));
}
