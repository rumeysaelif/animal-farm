import { initVoxelFarm, syncVoxelAnimals, updateVoxelAnimal } from "./farm3d.js?v=13";

const state = { animals: [], summaries: [], entities: [], editingId: null };
const typeMeta = {
    GOAT: { label: "Keçi" },
    SHEEP: { label: "Koyun" },
    CHICKEN: { label: "Tavuk" }
};

// Haritadaki çitlerin merkez ve güvenli hareket sınırları (yüzde cinsinden).
const habitats = {
    GOAT: { cx: 21.5, cy: 74.5, rx: 13, ry: 12, speed: 2.5, clearance: 1.18 },
    SHEEP: { cx: 70.5, cy: 74.5, rx: 13, ry: 12, speed: 2.0, clearance: 1.12 },
    CHICKEN: { cx: 73, cy: 25.5, rx: 14.5, ry: 12, speed: 3.6, clearance: 0.62 }
};

const elements = {
    stage: document.querySelector("#farm-stage"),
    layer: document.querySelector("#animal-layer"),
    loading: document.querySelector("#map-loading"),
    totalCount: document.querySelector("#total-animal-count"),
    dialog: document.querySelector("#animal-dialog"),
    form: document.querySelector("#animal-form"),
    dialogTitle: document.querySelector("#dialog-title"),
    dialogEyebrow: document.querySelector("#dialog-eyebrow"),
    typeInput: document.querySelector("#animal-type"),
    nameInput: document.querySelector("#animal-name"),
    genderInput: document.querySelector("#animal-gender"),
    formError: document.querySelector("#form-error"),
    saveButton: document.querySelector("#save-animal"),
    toast: document.querySelector("#toast")
};

async function apiRequest(path, options = {}) {
    const response = await fetch(path, {
        headers: options.body ? { "Content-Type": "application/json" } : {},
        ...options
    });
    if (!response.ok) {
        let error;
        try { error = await response.json(); }
        catch { error = { message: "Çiftliğe ulaşılamadı." }; }
        const fields = error.fieldErrors?.map(item => item.message).join(" ");
        throw new Error(fields || error.message || "İşlem tamamlanamadı.");
    }
    return response.status === 204 ? null : response.json();
}

async function refreshFarm() {
    elements.loading.hidden = false;
    try {
        const [animals, summaries] = await Promise.all([
            apiRequest("/api/animals"),
            apiRequest("/api/animal-types")
        ]);
        state.animals = animals;
        state.summaries = summaries;
        renderCapacity();
        createAnimalEntities();
        elements.totalCount.textContent = animals.length;
        elements.loading.hidden = true;
    } catch (error) {
        elements.loading.innerHTML = `<span aria-hidden="true">🛠️</span> ${escapeHtml(error.message)}`;
        showToast(error.message, true);
    }
}

function renderCapacity() {
    state.summaries.forEach(summary => {
        const label = document.querySelector(`[data-capacity-for="${summary.type}"]`);
        const hud = document.querySelector(`[data-zone="${summary.type}"]`);
        const addButton = document.querySelector(`[data-add-type="${summary.type}"]`);
        const capacity = summary.maxCapacity ?? (summary.type === "CHICKEN" ? 8 : 6);
        const isFull = summary.count >= capacity;
        if (label) label.textContent = `${summary.count} / ${capacity}`;
        hud?.classList.toggle("is-full", isFull);
        if (addButton) {
            addButton.disabled = isFull;
            addButton.title = isFull ? "Bu yaşam alanı dolu" : `${typeMeta[summary.type].label} ekle`;
        }
    });
}

function createAnimalEntities() {
    elements.layer.innerHTML = "";
    state.entities = [];

    state.animals.forEach(animal => {
        const habitat = habitats[animal.type];
        const position = findFreePosition(animal.type);
        const entity = {
            animal,
            x: position.x,
            y: position.y,
            vx: 0,
            vy: 0,
            targetX: position.x,
            targetY: position.y,
            behavior: "IDLE",
            behaviorTimer: 0.3 + Math.random(),
            personality: 0.82 + seededNumber(animal.id) * 0.36,
            paused: false,
            element: createAnimalElement(animal)
        };
        state.entities.push(entity);
        elements.layer.appendChild(entity.element);
        placeEntity(entity);
    });
    syncVoxelAnimals(state.entities);
}

function findFreePosition(type) {
    const habitat = habitats[type];
    for (let attempt = 0; attempt < 80; attempt++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * 0.82;
        const candidate = {
            x: habitat.cx + Math.cos(angle) * habitat.rx * radius,
            y: habitat.cy + Math.sin(angle) * habitat.ry * radius
        };
        const clear = state.entities
            .filter(entity => entity.animal.type === type)
            .every(entity => worldDistance(entity, candidate) >= habitat.clearance);
        if (clear) return candidate;
    }
    return { x: habitat.cx, y: habitat.cy };
}

function createAnimalElement(animal) {
    const type = typeMeta[animal.type];
    const wrapper = document.createElement("div");
    wrapper.className = "farm-animal";
    wrapper.dataset.type = animal.type;
    wrapper.tabIndex = 0;
    wrapper.setAttribute("role", "group");
    wrapper.setAttribute("aria-label", `${animal.name}, ${type.label}`);
    wrapper.innerHTML = `
        <span class="animal-focus-ring" aria-hidden="true"></span>
        <div class="animal-tooltip">
            <strong>${escapeHtml(animal.name)}</strong>
            <p>${type.label} · ${animal.gender === "FEMALE" ? "Dişi" : "Erkek"}</p>
            <div class="tooltip-actions">
                <button class="edit-animal" type="button">Düzenle</button>
                <button class="delete-animal" type="button">Çıkar</button>
            </div>
        </div>`;

    wrapper.querySelector(".edit-animal").addEventListener("click", event => {
        event.stopPropagation();
        openEditDialog(animal.id);
    });
    wrapper.querySelector(".delete-animal").addEventListener("click", event => {
        event.stopPropagation();
        deleteAnimal(animal.id);
    });
    return wrapper;
}

let lastFrame = performance.now();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateFarm(now) {
    const delta = Math.min((now - lastFrame) / 1000, 0.04);
    lastFrame = now;
    if (!reducedMotion) {
        updateWandering(delta);
        separateAnimals();
        state.entities.forEach(placeEntity);
    }
    requestAnimationFrame(animateFarm);
}

function updateWandering(delta) {
    state.entities.forEach(entity => {
        const isHovered = entity.element.matches(":hover") || entity.element.matches(":focus-within");
        entity.paused = isHovered;
        entity.behaviorTimer -= delta;

        if (entity.behaviorTimer <= 0) chooseNextBehavior(entity);
        if (entity.paused) {
            entity.element.classList.remove("is-walking", "is-grazing", "is-pecking");
            return;
        }

        const habitat = habitats[entity.animal.type];
        if (entity.behavior === "WALK") {
            const dx = entity.targetX - entity.x;
            const dy = entity.targetY - entity.y;
            const distance = Math.hypot(dx, dy);
            if (distance < 1.1) {
                chooseNextBehavior(entity, true);
            } else {
                const speed = habitat.speed * entity.personality;
                const desiredVx = dx / distance * speed;
                const desiredVy = dy / distance * speed * 0.62;
                const steering = Math.min(delta * 2.4, 1);
                entity.vx += (desiredVx - entity.vx) * steering;
                entity.vy += (desiredVy - entity.vy) * steering;
            }
        } else {
            const braking = Math.max(0, 1 - delta * 4.2);
            entity.vx *= braking;
            entity.vy *= braking;
        }

        entity.x += entity.vx * delta;
        entity.y += entity.vy * delta;
        keepInsideHabitat(entity);
        applyBehaviorClass(entity);
    });
}

function chooseNextBehavior(entity, arrived = false) {
    const type = entity.animal.type;
    const roll = Math.random();
    const activityChance = type === "SHEEP" ? 0.48 : type === "CHICKEN" ? 0.40 : 0.27;

    if (arrived && roll < activityChance) {
        entity.behavior = type === "CHICKEN" ? "PECK" : "GRAZE";
        entity.behaviorTimer = type === "SHEEP" ? 2.5 + Math.random() * 3.5 : 1.3 + Math.random() * 2.2;
        return;
    }

    if (roll < 0.24) {
        entity.behavior = "IDLE";
        entity.behaviorTimer = 0.8 + Math.random() * 2.1;
        return;
    }

    const habitat = habitats[type];
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random()) * 0.76;
    entity.targetX = habitat.cx + Math.cos(angle) * habitat.rx * radius;
    entity.targetY = habitat.cy + Math.sin(angle) * habitat.ry * radius;
    entity.behavior = "WALK";
    entity.behaviorTimer = 3.5 + Math.random() * 5;
}

function applyBehaviorClass(entity) {
    entity.element.classList.toggle("is-walking", entity.behavior === "WALK");
    entity.element.classList.toggle("is-grazing", entity.behavior === "GRAZE");
    entity.element.classList.toggle("is-pecking", entity.behavior === "PECK");
}

function keepInsideHabitat(entity) {
    const habitat = habitats[entity.animal.type];
    const dx = entity.x - habitat.cx;
    const dy = entity.y - habitat.cy;
    const normalized = (dx * dx) / (habitat.rx * habitat.rx) + (dy * dy) / (habitat.ry * habitat.ry);
    if (normalized <= 0.88) return;

    const scale = Math.sqrt(0.86 / normalized);
    entity.x = habitat.cx + dx * scale;
    entity.y = habitat.cy + dy * scale;
    entity.targetX = habitat.cx + (Math.random() - 0.5) * habitat.rx;
    entity.targetY = habitat.cy + (Math.random() - 0.5) * habitat.ry;
    entity.behavior = "WALK";
    entity.behaviorTimer = 2 + Math.random() * 2;
}

function separateAnimals() {
    for (let pass = 0; pass < 2; pass++) {
        for (let firstIndex = 0; firstIndex < state.entities.length; firstIndex++) {
            for (let secondIndex = firstIndex + 1; secondIndex < state.entities.length; secondIndex++) {
                const first = state.entities[firstIndex];
                const second = state.entities[secondIndex];
                if (first.animal.type !== second.animal.type) continue;

                const habitat = habitats[first.animal.type];
                const dxWorld = (second.x - first.x) * 0.35;
                const dzWorld = (second.y - first.y) * 0.235;
                const distance = Math.hypot(dxWorld, dzWorld) || 0.001;
                if (distance >= habitat.clearance) continue;

                const overlap = (habitat.clearance - distance) / 2 + 0.015;
                const nx = dxWorld / distance;
                const nz = dzWorld / distance;
                if (!first.paused) {
                    first.x -= nx * overlap / 0.35;
                    first.y -= nz * overlap / 0.235;
                }
                if (!second.paused) {
                    second.x += nx * overlap / 0.35;
                    second.y += nz * overlap / 0.235;
                }
                first.vx -= nx * 0.9;
                first.vy -= nz * 0.6;
                second.vx += nx * 0.9;
                second.vy += nz * 0.6;
                keepInsideHabitat(first);
                keepInsideHabitat(second);
            }
        }
    }
}

function worldDistance(first, second) {
    return Math.hypot((first.x - second.x) * 0.49, (first.y - second.y) * 0.329);
}

function placeEntity(entity) {
    updateVoxelAnimal(entity);
}

function seededNumber(value) {
    let hash = 0;
    for (let index = 0; index < value.length; index++) hash = (hash * 31 + value.charCodeAt(index)) | 0;
    return Math.abs(hash % 1000) / 1000;
}

function openCreateDialog(type = "GOAT") {
    const summary = state.summaries.find(item => item.type === type);
    if (summary && summary.count >= summary.maxCapacity) {
        showToast(`${typeMeta[type].label} alanı dolu.`, true);
        return;
    }
    state.editingId = null;
    elements.form.reset();
    elements.typeInput.value = type;
    elements.typeInput.disabled = false;
    elements.dialogEyebrow.textContent = "Yeni çiftlik sakini";
    elements.dialogTitle.textContent = `${typeMeta[type].label} ekle`;
    elements.saveButton.textContent = "Çiftliğe ekle";
    elements.formError.textContent = "";
    elements.dialog.showModal();
    elements.nameInput.focus();
}

function openEditDialog(id) {
    const animal = state.animals.find(item => item.id === id);
    if (!animal) return;
    state.editingId = id;
    elements.nameInput.value = animal.name;
    elements.typeInput.value = animal.type;
    elements.typeInput.disabled = true;
    elements.genderInput.value = animal.gender;
    elements.dialogEyebrow.textContent = `${typeMeta[animal.type].label} bilgileri`;
    elements.dialogTitle.textContent = animal.name;
    elements.saveButton.textContent = "Değişiklikleri kaydet";
    elements.formError.textContent = "";
    elements.dialog.showModal();
}

async function saveAnimal(event) {
    event.preventDefault();
    elements.formError.textContent = "";
    elements.saveButton.disabled = true;
    const body = {
        name: elements.nameInput.value.trim(),
        gender: elements.genderInput.value
    };
    try {
        if (state.editingId) {
            await apiRequest(`/api/animals/${state.editingId}`, { method: "PUT", body: JSON.stringify(body) });
            showToast(`${body.name} güncellendi.`);
        } else {
            await apiRequest("/api/animals", {
                method: "POST",
                body: JSON.stringify({ type: elements.typeInput.value, ...body })
            });
            showToast(`${body.name} çiftliğe katıldı!`);
        }
        elements.dialog.close();
        await refreshFarm();
    } catch (error) {
        elements.formError.textContent = error.message;
    } finally {
        elements.saveButton.disabled = false;
    }
}

async function deleteAnimal(id) {
    const animal = state.animals.find(item => item.id === id);
    if (!animal || !window.confirm(`${animal.name} çiftlikten çıkarılsın mı?`)) return;
    try {
        await apiRequest(`/api/animals/${id}`, { method: "DELETE" });
        showToast(`${animal.name} çiftlikten çıkarıldı.`);
        await refreshFarm();
    } catch (error) { showToast(error.message, true); }
}

let toastTimer;
function showToast(message, isError = false) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.toggle("is-error", isError);
    elements.toast.classList.add("is-visible");
    toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 2800);
}

function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function registerWebMcpTools() {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const registration = context.registerTool({
        name: "list_farm_animals",
        title: "Çiftlik hayvanlarını listele",
        description: "Üç yaşam alanındaki hayvanları ve doluluk bilgilerini listeler.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        async execute() {
            return { animals: await apiRequest("/api/animals"), habitats: await apiRequest("/api/animal-types") };
        }
    }, { signal: lifecycle.signal });
    Promise.resolve(registration).catch(() => undefined);
}

document.querySelector("#open-create-dialog").addEventListener("click", () => openCreateDialog());
document.querySelectorAll("[data-add-type]").forEach(button => {
    button.addEventListener("click", () => openCreateDialog(button.dataset.addType));
});
document.querySelector("#close-dialog").addEventListener("click", () => elements.dialog.close());
document.querySelector("#cancel-dialog").addEventListener("click", () => elements.dialog.close());
elements.form.addEventListener("submit", saveAnimal);
elements.dialog.addEventListener("click", event => {
    if (event.target === elements.dialog) elements.dialog.close();
});

initVoxelFarm()
    .then(refreshFarm)
    .catch(error => {
        elements.loading.innerHTML = `<span aria-hidden="true">🧊</span> ${escapeHtml(error.message)}`;
        showToast(error.message, true);
    });
registerWebMcpTools();
requestAnimationFrame(animateFarm);
