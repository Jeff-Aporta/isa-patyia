export function readImagesFromClipboard(items) {
  const out = [];
  for (const item of items || []) {
    if (item.type.startsWith("image/")) {
      const f = item.getAsFile();
      if (f) out.push(f);
    }
  }
  return out;
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("No se pudo leer la imagen"));
    r.readAsDataURL(file);
  });
}

export async function filesToImageEntries(files) {
  const added = [];
  for (const file of files || []) {
    if (!file?.type?.startsWith("image/")) continue;
    const dataUrl = await fileToDataUrl(file);
    if (!String(dataUrl).startsWith("data:")) continue;
    added.push({ name: file.name || "imagen", dataUrl });
  }
  return added;
}
