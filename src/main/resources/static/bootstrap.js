const loading = document.querySelector("#map-loading");

const timeout = window.setTimeout(() => {
    if (loading && !loading.hidden) {
        loading.innerHTML = '<span aria-hidden="true">🧊</span> 3B çiftlik beklenenden uzun sürdü.';
    }
}, 15000);

import("/app.js?v=13")
    .then(() => window.clearTimeout(timeout))
    .catch(error => {
        window.clearTimeout(timeout);
        console.error("Çiftlik başlatılamadı.", error);
        if (loading) {
            loading.innerHTML = `<span aria-hidden="true">🛠️</span> ${error.message || "3B çiftlik başlatılamadı."}`;
        }
    });
