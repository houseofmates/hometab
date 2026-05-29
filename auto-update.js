// auto-update check for new-tab (Tabliss fork)
// checks github.com/joelshepherd/tabliss for new releases
(function() {
  const REPO = 'joelshepherd/tabliss';
  const CHECK_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours
  const STORAGE_KEY = 'new-tab-latest-version';

  async function checkUpdate() {
    try {
      const resp = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
      if (!resp.ok) return;
      const data = await resp.json();
      const latest = data.tag_name.replace(/^v/, '');
      const current = browser.runtime.getManifest().version;
      if (latest !== current) {
        browser.storage.local.set({ [STORAGE_KEY]: { version: latest, url: data.html_url, checked: Date.now() } });
        if (typeof browser.notifications !== 'undefined') {
          browser.notifications.create('new-tab-update', {
            type: 'basic',
            iconUrl: 'icons/32.png',
            title: 'new-tab update available',
            message: `version ${latest} is available (you have ${current})`
          });
        }
      }
    } catch(e) { /* silent fail */ }
  }

  // check on install/startup and periodically
  browser.runtime.onStartup.addListener(checkUpdate);
  browser.alarms.create('new-tab-update-check', { periodInMinutes: 360 });
  browser.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'new-tab-update-check') checkUpdate();
  });
  checkUpdate();
})();
