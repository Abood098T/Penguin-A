"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import AdCard from "@/components/AdCard";
import AdPreviewModal from "@/components/AdPreviewModal";
import { hasToken } from "@/lib/token";
import { exportAdsToCSV } from "@/lib/exportCsv";
import {
  getFolders,
  createFolder,
  deleteFolder,
  renameFolder,
  removeAdFromFolder,
} from "@/lib/folders";

export default function FoldersPage() {
  const router = useRouter();
  const [folders, setFolders] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [newName, setNewName] = useState("");
  const [previewAd, setPreviewAd] = useState(null);

  useEffect(() => {
    if (!hasToken()) {
      router.replace("/settings");
      return;
    }
    const f = getFolders();
    setFolders(f);
    setActiveId(f[0]?.id || null);
  }, [router]);

  function refresh() {
    setFolders(getFolders());
  }

  function handleCreate() {
    if (!newName.trim()) return;
    const folder = createFolder(newName);
    setNewName("");
    refresh();
    setActiveId(folder.id);
  }

  function handleDelete(id) {
    deleteFolder(id);
    refresh();
    setActiveId((prev) => (prev === id ? null : prev));
  }

  const active = folders.find((f) => f.id === activeId);

  return (
    <>
      <Topbar />
      <div className="container folders-layout">
        <aside className="folders-sidebar">
          <h3 style={{ marginTop: 0 }}>المجلدات</h3>
          {folders.map((f) => (
            <div
              key={f.id}
              className={`folder-item ${activeId === f.id ? "active" : ""}`}
              onClick={() => setActiveId(f.id)}
            >
              <span>{f.name}</span>
              <span className="badge">{f.adIds.length}</span>
            </div>
          ))}
          <div className="folder-new-row" style={{ marginTop: 14 }}>
            <input
              placeholder="مجلد جديد..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button onClick={handleCreate}>+</button>
          </div>
        </aside>

        <section style={{ flex: 1 }}>
          {!active && <div className="empty-state">اختر أو أنشئ مجلد.</div>}
          {active && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>{active.name}</h2>
                <div style={{ display: "flex", gap: 8 }}>
                  {active.adIds.length > 0 && (
                    <button
                      className="secondary"
                      onClick={() => exportAdsToCSV(active.adIds, `${active.name}.csv`)}
                    >
                      تصدير CSV
                    </button>
                  )}
                  {active.id !== "default" && (
                    <button className="secondary" onClick={() => handleDelete(active.id)}>
                      حذف المجلد
                    </button>
                  )}
                </div>
              </div>

              {active.adIds.length === 0 && (
                <div className="empty-state">ما في إعلانات بهاد المجلد لسة.</div>
              )}

              <div className="grid">
                {active.adIds.map((ad) => (
                  <div key={ad.id} style={{ position: "relative" }}>
                    <AdCard ad={ad} onPreview={setPreviewAd} />
                    <button
                      className="secondary remove-from-folder"
                      onClick={() => {
                        removeAdFromFolder(active.id, ad.id);
                        refresh();
                      }}
                    >
                      إزالة من المجلد
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <AdPreviewModal ad={previewAd} onClose={() => setPreviewAd(null)} />
    </>
  );
}
