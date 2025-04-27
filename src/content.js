/* global chrome */
document.addEventListener('mouseup', (event) => {
  const selection = window.getSelection().toString().trim();
  if (selection) {
    const existing = document.getElementById('highlight-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'highlight-popup';
    popup.textContent = 'Save Highlight?';
    Object.assign(popup.style, {
      position: 'absolute',
      top: `${event.pageY}px`,
      left: `${event.pageX}px`,
      background: '#ff0',
      padding: '5px',
      border: '1px solid #000',
      cursor: 'pointer',
      zIndex: 9999,
    });

    document.body.appendChild(popup);

    popup.onclick = () => {
      if (chrome?.storage?.local) {
        chrome.storage.local.get({ highlights: [] }, (data) => {
          const highlights = data.highlights;
          highlights.push({ text: selection, url: window.location.href });
          chrome.storage.local.set({ highlights });
        });
      } else {
        console.error('chrome.storage is not available.');
      }
      popup.remove();
    };    

    setTimeout(() => popup.remove(), 5000);
  }
});
