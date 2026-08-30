"use client";
import { useState, useEffect, useRef } from "react";
import { getFolders, createFolder, addAdToFolder, removeAdFromFolder, getFoldersForAd } from "@/lib/folders";

export default function SaveToFolderButton({ ad }) {
  const [open, setOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [memberIds, setMemberIds] = useState([]);
  const [newName, setNewName] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    setFolders(getFolders());
    setMemberIds(getFoldersForAd(ad.id).map((f) => f.id));
  }, [ad.id]);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function toggleFolder(folderId) {
    if (memberIds.includes(folderId)) {
      removeAdFromFolder(folderId, ad.id);
      setMemberIds(memberIds.filter((id) => id !== folderId));
    } else {
      addAdToFolder(folderId, ad);
      setMemberIds([...memberIds, folderId]);
    }
  }

  function handleCreate() {
    if (!newName.trim()) return;
    const folder = createFolder(newName);
    addAdToFolder(folder.id, ad);
    setFolders(getFolders());
    setMemberIds([...memberIds, folder.id]);
    setNewName("");
  }

  const saved = memberIds.length > 0;

  return (
    <div className="folder-popover-wrap" ref={ref}>
      <button
        className={`save-btn ${saved ? "saved" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        {saved ? `محفوظ (${memberIds.length}) ✓` : "حفظ بمجلد"}
      </button>
      {open && (
        <div className="folder-popover">
          {folders.map((f) => (
            <label key={f.id} className="folder-row">
              <input
                type="checkbox"
                checked={memberIds.includes(f.id)}
                onChange={() => toggleFolder(f.id)}
              />
              {f.name}
            </label>
          ))}
          <div className="folder-new-row">
            <input
              placeholder="مجلد جديد..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button className="secondary" onClick={handleCreate}>+</button>
          </div>
        </div>
      )}
    </div>
  );
}
