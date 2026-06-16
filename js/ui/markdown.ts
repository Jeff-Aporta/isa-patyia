/** Markdown → HTML (marked GFM; sin breaks para preservar tablas). */

export function mdToHtml(src: string): string {
  if (!src) return "";
  try {
    if (typeof marked !== "undefined") {
      const html = marked.parse(String(src), {
        async: false,
        gfm: true,
        breaks: false,
      }) as string;
      return html.replace(/<table(\s|>)/g, '<div class="md-table-wrap"><table$1').replace(/<\/table>/g, "</table></div>");
    }
  } catch { /* ignore */ }
  return String(src)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");
}
