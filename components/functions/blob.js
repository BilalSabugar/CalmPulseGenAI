export const getBlobFromUri = (uri) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            resolve(xhr.response);
        };
        xhr.onerror = function (e) {
            console.log(e);
            reject(new Error('Blob fetch failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
    });
};

export function getFileExtension(uri) {
  // E.g. .../file.pdf?token=abc
  const clean = uri.split("?")[0];
  const parts = clean.split(".");
  if (parts.length > 1) {
    const ext = parts.pop();
    // guard against path segments without actual extension
    if (ext && ext.length <= 5) return ext.toLowerCase();
  }
  return "bin"; // fallback when unknown
}