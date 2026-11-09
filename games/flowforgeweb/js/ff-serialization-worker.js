/* FlowForge WebStudio — background serialization worker */
self.onmessage = function (event) {
  const { id, action, value, replacements } = event.data || {};
  try {
    if (action === 'json') {
      self.postMessage({ id, ok: true, result: JSON.stringify(value, null, 2) });
      return;
    }
    if (action === 'resolve-html') {
      let html = String(value || '');
      const map = replacements || {};
      html = html.replace(/asset:\/\/([A-Za-z0-9_-]+)/g, function (full, assetId) {
        return Object.prototype.hasOwnProperty.call(map, assetId) ? map[assetId] : full;
      });
      self.postMessage({ id, ok: true, result: html });
      return;
    }
    throw new Error('Operação de serialização desconhecida.');
  } catch (error) {
    self.postMessage({ id, ok: false, error: error && error.message ? error.message : String(error) });
  }
};
