const myr = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" });

export function formatMYR(value: number | string | null | undefined) {
  return myr.format(Number(value ?? 0));
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "TBA";
  return new Date(value).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateRange(start: string | null, end: string | null) {
  if (!start) return "Date to be announced";
  if (!end || end === start) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
