// Buat panel di DevTools
chrome.devtools.panels.create(
  "Brutu Suite",           // Judul panel
  "icons/icon-16.png",    // Icon (opsional, bisa gunakan path relatif)
  "panel.html",          // Halaman konten panel
  function(panel) {
    console.log("Panel API Slurp created");
  }
);