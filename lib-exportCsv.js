function csvEscape(value) {
  const str = String(value ?? "").replace(/"/g, '""');
  return `"${str}"`;
}

export function exportAdsToCSV(ads, filename = "swipe-file.csv") {
  const headers = ["page_name", "platforms", "ad_text", "start_date", "snapshot_url"];
  const rows = ads.map((ad) => [
    ad.page_name || "",
    (ad.publisher_platforms || []).join(" | "),
    ad.ad_creative_bodies?.[0] || "",
    ad.ad_delivery_start_time || "",
    ad.ad_snapshot_url || "",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  // BOM حتى إكسل يفتح العربي صح
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
