import * as THREE from "/vendor/three/three.module.js";
import { FBXLoader } from "/vendor/three/addons/loaders/FBXLoader.js";
import { clone as cloneSkeleton } from "/vendor/three/addons/utils/SkeletonUtils.js";
import { OrbitControls } from "/vendor/three/addons/controls/OrbitControls.js";

const MODEL_ROOT = "/assets/voxel-farm";
const TERRAIN_TOP = 0.12;
const sceneState = {
    stage: null,
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    clock: new THREE.Clock(),
    loader: new FBXLoader(),
    textureLoader: new THREE.TextureLoader(),
    templates: new Map(),
    animals: new Map(),
    syncVersion: 0,
    ready: false
};

const animalAssets = {
    GOAT: {
        model: `${MODEL_ROOT}/FBX/Animals/TVS_VoxelFarm_Goat.fbx`,
        texture: `${MODEL_ROOT}/Textures/Animals/TVS_VoxelFarm_Goat_Texture.png`,
        height: 0.78,
        rotation: 0,
        palette: "GOAT"
    },
    SHEEP: {
        model: `${MODEL_ROOT}/Animations/Animals/Sheep_Walk_Anim.fbx`,
        texture: `${MODEL_ROOT}/Textures/Animals/TVS_VoxelFarm_Sheep_Texture.png`,
        height: 0.74,
        rotation: 0,
        palette: "SHEEP"
    },
    CHICKEN: {
        model: `${MODEL_ROOT}/Animations/Animals/Chicken_Walk_Anim.fbx`,
        texture: `${MODEL_ROOT}/Textures/Animals/TVS_VoxelFarm_Chicken_Texture.png`,
        height: 0.43,
        rotation: 0,
        palette: "CHICKEN"
    }
};

export async function initVoxelFarm() {
    if (sceneState.ready) return;
    const stage = document.querySelector("#farm-stage");
    const canvas = document.querySelector("#farm-canvas");
    if (!stage || !canvas) throw new Error("3B çiftlik alanı bulunamadı.");

    sceneState.stage = stage;
    sceneState.scene = new THREE.Scene();
    sceneState.scene.background = new THREE.Color(0x9fe3f5);

    sceneState.camera = new THREE.OrthographicCamera(-25, 25, 17.5, -17.5, 0.1, 180);
    sceneState.camera.position.set(38, 38, 42);
    sceneState.camera.lookAt(0, 0, 0);

    sceneState.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    sceneState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    sceneState.renderer.shadowMap.enabled = true;
    sceneState.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    sceneState.renderer.outputColorSpace = THREE.SRGBColorSpace;
    sceneState.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    sceneState.renderer.toneMappingExposure = 1.08;
    sceneState.controls = new OrbitControls(sceneState.camera, canvas);
    sceneState.controls.target.set(0, 0.2, 0);
    sceneState.controls.enableDamping = true;
    sceneState.controls.dampingFactor = 0.08;
    sceneState.controls.enablePan = true;
    sceneState.controls.minZoom = 0.72;
    sceneState.controls.maxZoom = 2.4;
    sceneState.controls.minPolarAngle = Math.PI * 0.18;
    sceneState.controls.maxPolarAngle = Math.PI * 0.47;
    sceneState.controls.update();

    addLighting();
    buildVoxelIsland();
    buildPaddock(-14.0, 8.1, 15.4, 10.6, 0xd7b96e);
    buildPaddock(10.1, 8.1, 15.4, 10.6, 0xb7d978);
    buildPaddock(11.3, -8.1, 16.8, 10.5, 0xe0bd72);
    addDecorations();

    const resizeObserver = new ResizeObserver(resizeRenderer);
    resizeObserver.observe(stage);
    resizeRenderer();
    sceneState.ready = true;
    requestAnimationFrame(renderFrame);
}

function addLighting() {
    sceneState.scene.add(new THREE.HemisphereLight(0xdff7ff, 0x6e5b37, 2.1));
    const sun = new THREE.DirectionalLight(0xfff0c2, 3.2);
    sun.position.set(-9, 18, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -18;
    sun.shadow.camera.right = 18;
    sun.shadow.camera.top = 18;
    sun.shadow.camera.bottom = -18;
    sceneState.scene.add(sun);
}

function buildVoxelIsland() {
    const soil = new THREE.Mesh(
        new THREE.BoxGeometry(51.2, 1.25, 34.0),
        new THREE.MeshStandardMaterial({ color: 0x8a5b35, roughness: 1 })
    );
    soil.position.y = -0.55;
    soil.receiveShadow = true;
    soil.castShadow = true;
    sceneState.scene.add(soil);

    const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x68bd45, roughness: 1 });
    const grass = new THREE.Mesh(new THREE.BoxGeometry(50.6, 0.34, 33.4), grassMaterial);
    grass.position.y = -0.03;
    grass.receiveShadow = true;
    sceneState.scene.add(grass);

    const patchGeometry = new THREE.BoxGeometry(0.48, 0.025, 0.48);
    const patchMaterials = [0x78c84e, 0x5ead3e, 0x8bd159].map(color =>
        new THREE.MeshStandardMaterial({ color, roughness: 1 })
    );
    for (let index = 0; index < 420; index++) {
        const patch = new THREE.Mesh(patchGeometry, patchMaterials[index % patchMaterials.length]);
        patch.position.set(-24.8 + seeded(index * 17) * 49.6, 0.155, -16.2 + seeded(index * 31 + 7) * 32.4);
        patch.rotation.y = (index % 4) * Math.PI / 2;
        sceneState.scene.add(patch);
    }

    addBlockPath(0, 0, 3.0, 32.2, 0xe8cf8d);
    addBlockPath(0, 0, 48.2, 2.7, 0xe8cf8d);
    addBlockPath(-15.5, -4.3, 2.7, 8.6, 0xe8cf8d);
}

function addBlockPath(x, z, width, depth, color) {
    const path = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.08, depth),
        new THREE.MeshStandardMaterial({ color, roughness: 1 })
    );
    path.position.set(x, 0.17, z);
    path.receiveShadow = true;
    sceneState.scene.add(path);
}

function buildCropField() {
    const soil = new THREE.MeshStandardMaterial({ color: 0x704326, roughness: 1 });
    const border = new THREE.MeshStandardMaterial({ color: 0xb57a3f, roughness: 0.95 });
    const fieldX = -7.8;
    const fieldZ = -10.8;
    const fieldWidth = 9.0;
    const fieldDepth = 7.0;

    const base = new THREE.Mesh(new THREE.BoxGeometry(fieldWidth, 0.14, fieldDepth), soil);
    base.position.set(fieldX, 0.2, fieldZ);
    base.receiveShadow = true;
    sceneState.scene.add(base);

    for (let row = 0; row < 5; row++) {
        const ridge = new THREE.Mesh(new THREE.BoxGeometry(fieldWidth - 0.6, 0.12, 0.72), soil);
        ridge.position.set(fieldX, 0.31, fieldZ - 2.35 + row * 1.18);
        ridge.castShadow = true;
        ridge.receiveShadow = true;
        sceneState.scene.add(ridge);
    }

    for (const z of [fieldZ - fieldDepth / 2, fieldZ + fieldDepth / 2]) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(fieldWidth + 0.25, 0.2, 0.18), border);
        beam.position.set(fieldX, 0.34, z);
        beam.castShadow = true;
        sceneState.scene.add(beam);
    }
    for (const x of [fieldX - fieldWidth / 2, fieldX + fieldWidth / 2]) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, fieldDepth), border);
        beam.position.set(x, 0.34, fieldZ);
        beam.castShadow = true;
        sceneState.scene.add(beam);
    }
}

function addVoxelBox(group, size, position, color) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size[0], size[1], size[2]),
        new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
    );
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
}

function addVoxelScarecrow(x, z) {
    const scarecrow = new THREE.Group();
    addVoxelBox(scarecrow, [0.16, 2.15, 0.16], [0, 1.08, 0], 0x70452a);
    addVoxelBox(scarecrow, [1.65, 0.16, 0.16], [0, 1.7, 0], 0x70452a);
    addVoxelBox(scarecrow, [0.72, 0.72, 0.34], [0, 1.48, 0], 0x3276b8);
    addVoxelBox(scarecrow, [0.30, 0.74, 0.30], [-0.22, 0.84, 0], 0x527ec0).rotation.z = -0.12;
    addVoxelBox(scarecrow, [0.30, 0.74, 0.30], [0.22, 0.84, 0], 0x527ec0).rotation.z = 0.12;
    addVoxelBox(scarecrow, [0.48, 0.48, 0.42], [0, 2.08, 0], 0xe7b66a);
    addVoxelBox(scarecrow, [0.82, 0.12, 0.62], [0, 2.36, 0], 0xd5a52e);
    addVoxelBox(scarecrow, [0.54, 0.22, 0.48], [0, 2.48, 0], 0xe0b63f);
    scarecrow.position.set(x, TERRAIN_TOP, z);
    scarecrow.rotation.y = -0.3;
    sceneState.scene.add(scarecrow);
}

function addVoxelTractor(x, z) {
    const tractor = new THREE.Group();
    addVoxelBox(tractor, [2.5, 0.72, 1.25], [0, 0.83, 0], 0x238a35);
    addVoxelBox(tractor, [1.0, 0.78, 1.12], [-0.62, 1.46, 0], 0x2da642);
    addVoxelBox(tractor, [0.82, 0.64, 1.0], [0.48, 1.25, 0], 0x183f2e);
    addVoxelBox(tractor, [0.98, 0.13, 1.18], [0.48, 1.65, 0], 0x1f7a31);
    addVoxelBox(tractor, [0.12, 0.72, 0.12], [-1.0, 1.62, 0.38], 0x3d3d35);
    addVoxelBox(tractor, [0.18, 0.18, 1.34], [-1.29, 0.76, 0], 0xe5c94c);

    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x242322, roughness: 1 });
    const hubMaterial = new THREE.MeshStandardMaterial({ color: 0xb8b8a7, roughness: 0.8 });
    for (const [wheelX, wheelRadius] of [[0.72, 0.62], [-0.82, 0.48]]) {
        for (const wheelZ of [-0.68, 0.68]) {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.32, 12), wheelMaterial);
            wheel.rotation.x = Math.PI / 2;
            wheel.position.set(wheelX, wheelRadius, wheelZ);
            wheel.castShadow = true;
            tractor.add(wheel);
            const hub = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius * 0.38, wheelRadius * 0.38, 0.34, 12), hubMaterial);
            hub.rotation.x = Math.PI / 2;
            hub.position.copy(wheel.position);
            tractor.add(hub);
        }
    }
    tractor.position.set(x, TERRAIN_TOP, z);
    tractor.rotation.y = -0.12;
    sceneState.scene.add(tractor);
}

function buildPaddock(x, z, width, depth, groundColor) {
    const ground = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.09, depth),
        new THREE.MeshStandardMaterial({ color: groundColor, roughness: 1 })
    );
    ground.position.set(x, 0.18, z);
    ground.receiveShadow = true;
    sceneState.scene.add(ground);

    addFenceLine(x - width / 2, z - depth / 2, width, false);
    addFenceLine(x - width / 2, z + depth / 2, width, false);
    addFenceLine(x - width / 2, z - depth / 2, depth, true);
    addFenceLine(x + width / 2, z - depth / 2, depth, true);
}

function addFenceLine(startX, startZ, length, vertical) {
    const wood = new THREE.MeshStandardMaterial({ color: 0x9a6338, roughness: 0.92 });
    const segments = Math.max(2, Math.ceil(length / 1.45));
    for (let index = 0; index <= segments; index++) {
        const distance = length * index / segments;
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.19, 1.05, 0.19), wood);
        post.position.set(startX + (vertical ? 0 : distance), 0.66, startZ + (vertical ? distance : 0));
        post.castShadow = true;
        sceneState.scene.add(post);
    }
    for (const height of [0.48, 0.86]) {
        const rail = new THREE.Mesh(
            new THREE.BoxGeometry(vertical ? 0.13 : length, 0.13, vertical ? length : 0.13),
            wood
        );
        rail.position.set(startX + (vertical ? 0 : length / 2), height, startZ + (vertical ? length / 2 : 0));
        rail.castShadow = true;
        sceneState.scene.add(rail);
    }
}

function addDecorations() {
    addEnvironmentModel("barn", `${MODEL_ROOT}/FBX/Environment/TVS_VoxelFarm_Barn.fbx`,
        `${MODEL_ROOT}/Textures/Environment/TVS_VoxelFarm_Barn_Texture.png`, -15.5, -10.2, 5.5, 0);
    buildCropField();
    addEnvironmentModel("windmill", `${MODEL_ROOT}/FBX/Environment/TVS_VoxelFarm_Windmill.fbx`,
        `${MODEL_ROOT}/Textures/Environment/TVS_VoxelFarm_Windmill_Texture.png`, 22.0, -13.1, 4.2, 0);
    addEnvironmentModel("tree-a", `${MODEL_ROOT}/FBX/Environment/TVS_VoxelFarm_AppleTree.fbx`,
        `${MODEL_ROOT}/Textures/Environment/TVS_VoxelFarm_AppleTree_Texture.png`, -23.0, -0.3, 3.2, 0);
    addEnvironmentModel("tree-b", `${MODEL_ROOT}/FBX/Environment/TVS_VoxelFarm_Tree.fbx`,
        `${MODEL_ROOT}/Textures/Environment/TVS_VoxelFarm_Tree_Texture.png`, 23.0, 13.4, 3.5, 0);
    addEnvironmentModel("tree-c", `${MODEL_ROOT}/FBX/Environment/TVS_VoxelFarm_LemonTree.fbx`,
        `${MODEL_ROOT}/Textures/Environment/TVS_VoxelFarm_LemonTree_Texture.png`, -23.0, -14.0, 3.0, 0);
    addEnvironmentModel("tree-d", `${MODEL_ROOT}/FBX/Environment/TVS_VoxelFarm_OrangeTree.fbx`,
        `${MODEL_ROOT}/Textures/Environment/TVS_VoxelFarm_OrangeTree_Texture.png`, 23.1, 0.7, 3.1, 0);
    addEnvironmentModel("hay", `${MODEL_ROOT}/FBX/Environment/TVS_VoxelFarm_HayBale.fbx`,
        `${MODEL_ROOT}/Textures/Environment/TVS_VoxelFarm_Haybale_Texture.png`, -20.5, -9.2, 1.0, 0);
    addVoxelScarecrow(-7.8, -10.8);
    addVoxelTractor(-7.5, -5.7);
    addEnvironmentModel("goat-trough", `${MODEL_ROOT}/FBX/Environment/TVS_VoxelFarm_WaterTrough.fbx`,
        `${MODEL_ROOT}/Textures/Environment/TVS_VoxelFarm_WaterTrough_Texture.png`, -14.0, 11.7, 0.65, 0);
    addEnvironmentModel("sheep-trough", `${MODEL_ROOT}/FBX/Environment/TVS_VoxelFarm_FoodTrough.fbx`,
        `${MODEL_ROOT}/Textures/Environment/TVS_VoxelFarm_FoodTrough_Texture.png`, 10.1, 11.7, 0.65, 0);
    addEnvironmentModel("chicken-trough", `${MODEL_ROOT}/FBX/Environment/TVS_VoxelFarm_EmptyTrough.fbx`,
        `${MODEL_ROOT}/Textures/Environment/TVS_VoxelFarm_EmptyTrough_Texture.png`, 11.3, -11.8, 0.55, 0);
    const cropRows = [
        { model: "Wheat", texture: "Wheat", z: -13.15, height: 0.72 },
        { model: "Tomato", texture: "Tomato", z: -11.97, height: 0.72 },
        { model: "StrawberryBush", texture: "StrawberryBush", z: -10.79, height: 0.58 },
        { model: "YoungPlant", texture: "YoungPlant", z: -9.61, height: 0.58 },
        { model: "Pumpkin", texture: "Pumpkin", z: -8.43, height: 0.5 }
    ];
    cropRows.forEach((crop, row) => {
        for (let column = 0; column < 7; column++) {
            const x = -10.8 + column * 1.0;
            addEnvironmentModel(`crop-${crop.model}`,
                `${MODEL_ROOT}/FBX/Environment/TVS_VoxelFarm_${crop.model}.fbx`,
                `${MODEL_ROOT}/Textures/Environment/TVS_VoxelFarm_${crop.texture}_Texture.png`,
                x, crop.z, crop.height, 0);
        }
    });
}

async function addEnvironmentModel(key, modelUrl, textureUrl, x, z, height, rotation) {
    try {
        const object = await loadAndPrepare(`${key}:${modelUrl}`, modelUrl, textureUrl, height);
        const instance = cloneSkeleton(object);
        instance.position.set(x, TERRAIN_TOP, z);
        instance.rotation.y = rotation;
        sceneState.scene.add(instance);
    } catch (error) {
        console.warn(`Voxel dekor yüklenemedi: ${key}`, error);
    }
}

export function syncVoxelAnimals(entities) {
    const syncVersion = ++sceneState.syncVersion;
    for (const record of sceneState.animals.values()) sceneState.scene?.remove(record.root);
    sceneState.animals.clear();
    if (!sceneState.ready) return;

    entities.forEach(async entity => {
        try {
            const asset = animalAssets[entity.animal.type];
            const template = await loadAndPrepare(entity.animal.type, asset.model, asset.texture, asset.height, asset.palette);
            if (syncVersion !== sceneState.syncVersion) return;

            const visual = cloneSkeleton(template);
            const root = new THREE.Group();
            root.add(visual);
            root.position.y = TERRAIN_TOP;
            sceneState.scene.add(root);

            let mixer = null;
            let action = null;
            if (template.animations?.length) {
                mixer = new THREE.AnimationMixer(visual);
                action = mixer.clipAction(template.animations[0]);
                action.play();
            }

            sceneState.animals.set(entity.animal.id, {
                root,
                visual,
                mixer,
                action,
                phase: seededHash(entity.animal.id) * Math.PI * 2,
                behavior: entity.behavior,
                moving: false,
                baseRotation: asset.rotation
            });
            updateVoxelAnimal(entity);
        } catch (error) {
            console.error(`${entity.animal.name} 3B olarak yüklenemedi.`, error);
            entity.element.classList.add("model-load-failed");
        }
    });
}

export function updateVoxelAnimal(entity) {
    const record = sceneState.animals.get(entity.animal.id);
    if (!record || !sceneState.camera || !sceneState.stage) return;

    const world = logicalToWorld(entity.x, entity.y);
    record.root.position.x = world.x;
    record.root.position.z = world.z;
    record.moving = entity.behavior === "WALK" && !entity.paused;
    record.behavior = entity.behavior;

    if (Math.hypot(entity.vx, entity.vy) > 0.12) {
        const heading = Math.atan2(entity.vx, entity.vy);
        record.root.rotation.y = record.baseRotation + heading;
    }
    if (record.action) record.action.timeScale = record.moving ? 1.05 * entity.personality : 0.08;

    const anchorHeight = entity.animal.type === "CHICKEN" ? 0.44 : 0.80;
    const projected = new THREE.Vector3(world.x, anchorHeight, world.z).project(sceneState.camera);
    entity.element.style.left = `${(projected.x * 0.5 + 0.5) * 100}%`;
    entity.element.style.top = `${(-projected.y * 0.5 + 0.5) * 100}%`;
    entity.element.style.zIndex = entity.element.matches(":hover") ? "500" : String(100 + Math.round(entity.y));
}

export function removeVoxelAnimal(id) {
    const record = sceneState.animals.get(id);
    if (!record) return;
    sceneState.scene?.remove(record.root);
    sceneState.animals.delete(id);
}

function logicalToWorld(x, y) {
    return { x: (x - 50) * 0.49, z: (y - 50) * 0.329 };
}

async function loadAndPrepare(key, modelUrl, textureUrl, targetHeight, palette = null) {
    if (sceneState.templates.has(key)) return sceneState.templates.get(key);
    const promise = Promise.all([
        sceneState.loader.loadAsync(modelUrl),
        sceneState.textureLoader.loadAsync(textureUrl).catch(() => null)
    ]).then(([object, loadedTexture]) => {
        const texture = loadedTexture && palette ? recolorAnimalTexture(loadedTexture, palette) : loadedTexture;
        if (texture) {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestMipmapNearestFilter;
        }
        object.traverse(child => {
            if (!child.isMesh) return;
            child.castShadow = true;
            child.receiveShadow = true;
            if (texture) {
                child.material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92 });
            }
        });
        normalizeModel(object, targetHeight);
        return object;
    });
    sceneState.templates.set(key, promise);
    return promise;
}

function recolorAnimalTexture(texture, palette) {
    const source = texture.image;
    if (!source?.width || !source?.height) return texture;
    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.imageSmoothingEnabled = false;
    context.drawImage(source, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);

    for (let index = 0; index < pixels.data.length; index += 4) {
        if (pixels.data[index + 3] === 0) continue;
        const red = pixels.data[index];
        const green = pixels.data[index + 1];
        const blue = pixels.data[index + 2];
        const light = red * 0.3 + green * 0.59 + blue * 0.11;

        if (palette === "GOAT") {
            const shade = light / 255;
            pixels.data[index] = 92 + shade * 145;
            pixels.data[index + 1] = 55 + shade * 105;
            pixels.data[index + 2] = 30 + shade * 63;
        } else if (palette === "SHEEP") {
            const darkPart = light < 95;
            const tone = darkPart ? 35 + light * 0.22 : 220 + light * 0.13;
            pixels.data[index] = tone;
            pixels.data[index + 1] = darkPart ? tone : tone - 4;
            pixels.data[index + 2] = darkPart ? tone + 3 : tone - 12;
        } else if (palette === "CHICKEN") {
            if (red > 145 && green < 95 && blue < 90) {
                pixels.data[index] = 225;
                pixels.data[index + 1] = 48;
                pixels.data[index + 2] = 38;
            } else if (red > 135 && green > 85 && blue < 95) {
                pixels.data[index] = 245;
                pixels.data[index + 1] = 181;
                pixels.data[index + 2] = 45;
            } else {
                const tone = 224 + light * 0.1;
                pixels.data[index] = tone;
                pixels.data[index + 1] = tone - 3;
                pixels.data[index + 2] = tone - 12;
            }
        }
    }

    context.putImageData(pixels, 0, 0);
    const recolored = texture.clone();
    recolored.image = canvas;
    recolored.needsUpdate = true;
    return recolored;
}

function normalizeModel(object, targetHeight) {
    object.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const scale = targetHeight / Math.max(size.y, 0.001);
    object.scale.multiplyScalar(scale);
    object.updateMatrixWorld(true);
    const scaledBox = new THREE.Box3().setFromObject(object);
    object.position.y -= scaledBox.min.y;
}

function resizeRenderer() {
    const width = Math.max(sceneState.stage.clientWidth, 1);
    const height = Math.max(sceneState.stage.clientHeight, 1);
    sceneState.renderer.setSize(width, height, false);
    const aspect = width / height;
    const viewHeight = 35;
    sceneState.camera.left = -viewHeight * aspect / 2;
    sceneState.camera.right = viewHeight * aspect / 2;
    sceneState.camera.top = viewHeight / 2;
    sceneState.camera.bottom = -viewHeight / 2;
    sceneState.camera.updateProjectionMatrix();
}

function renderFrame(elapsed) {
    requestAnimationFrame(renderFrame);
    if (!sceneState.ready) return;
    const delta = Math.min(sceneState.clock.getDelta(), 0.05);
    const seconds = elapsed / 1000;

    sceneState.animals.forEach(record => {
        record.mixer?.update(delta);
        const gait = record.moving ? Math.sin(seconds * 9 + record.phase) : 0;
        const activity = record.behavior === "GRAZE" || record.behavior === "PECK";
        record.root.position.y = TERRAIN_TOP + (record.moving ? Math.abs(gait) * 0.055 : 0);
        record.visual.rotation.z = record.moving ? gait * 0.025 : 0;
        record.visual.rotation.x = activity ? 0.13 + Math.sin(seconds * 5 + record.phase) * 0.08 : 0;
    });
    sceneState.controls?.update();
    sceneState.renderer.render(sceneState.scene, sceneState.camera);
}

function seeded(index) {
    const value = Math.sin(index * 12.9898) * 43758.5453;
    return value - Math.floor(value);
}

function seededHash(value) {
    let hash = 0;
    for (let index = 0; index < value.length; index++) hash = (hash * 31 + value.charCodeAt(index)) | 0;
    return Math.abs(hash % 1000) / 1000;
}
