// src/pages/Chat3D.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const API = "http://localhost:5000";
const AVATAR_FILE = "/brunette.glb"; // must be in public folder
const SESSION_ID = "session_" + Date.now();

export const Chat3D: React.FC = () => {
    const canvasHostRef = useRef<HTMLDivElement | null>(null);

    // three refs
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);
    const modelRef = useRef<THREE.Object3D | null>(null);
    const morphMeshesRef = useRef<THREE.Mesh[]>([]);
    const rafRef = useRef<number | null>(null);
    const clockRef = useRef(new THREE.Clock());

    // audio refs
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    // state
    const [modelLoaded, setModelLoaded] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [recordingText, setRecordingText] = useState<string>("");
    const [modelStatus, setModelStatus] = useState<string | null>(null);
    const [sttError, setSttError] = useState<string | null>(null);

    // small mouth/blink state
    const mouthOpenRef = useRef(0);
    const blinkTimerRef = useRef(0);
    const nextBlinkRef = useRef(2 + Math.random() * 4);

    // media recorder ref
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    useEffect(() => {
        initScene();
        return () => cleanup();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ----------------------
    // Three.js init
    // ----------------------
    function initScene() {
        const host = canvasHostRef.current;
        if (!host) return;

        // scene + camera
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            35,
            host.clientWidth / host.clientHeight,
            0.1,
            1000
        );

        // renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(host.clientWidth, host.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;
        host.appendChild(renderer.domElement);

        // lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const key = new THREE.DirectionalLight(0xffffff, 0.8);
        key.position.set(1, 2, 2);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xffffff, 0.35);
        fill.position.set(-1, 1, 2);
        scene.add(fill);
        const back = new THREE.DirectionalLight(0xffffff, 0.25);
        back.position.set(0, 1, -2);
        scene.add(back);

        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;

        // loader
        const loader = new GLTFLoader();
        loader.load(
            AVATAR_FILE,
            (gltf) => {
                if (modelRef.current) {
                    scene.remove(modelRef.current);
                    modelRef.current = null;
                    morphMeshesRef.current = [];
                }

                const model = gltf.scene;
                scene.add(model);
                modelRef.current = model;

                // --- Compute bounding boxes and focus ---
                const fullBox = new THREE.Box3().setFromObject(model);
                const modelCenter = fullBox.getCenter(new THREE.Vector3());

                let focusBox = fullBox.clone();
                let headMesh: THREE.Object3D | null = null;
                model.traverse((child) => {
                    if ((child as any).isMesh) {
                        const name = (child as any).name || "";
                        if (/head|face|skull|cranium|jaw/i.test(name)) headMesh = child;
                    }
                });

                if (headMesh) focusBox = new THREE.Box3().setFromObject(headMesh);
                else {
                    const sizeVec = fullBox.getSize(new THREE.Vector3());
                    const faceTop = fullBox.max.y;
                    const faceBottom = fullBox.max.y - sizeVec.y * 0.35;
                    focusBox = new THREE.Box3(
                        new THREE.Vector3(fullBox.min.x, faceBottom, fullBox.min.z),
                        new THREE.Vector3(fullBox.max.x, faceTop, fullBox.max.z)
                    );
                }

                // shift model to origin
                model.position.sub(modelCenter);

                // adjust focus center after shift
                const focusCenter = focusBox.getCenter(new THREE.Vector3()).sub(modelCenter);
                const focusSize = focusBox.getSize(new THREE.Vector3()).length();

                camera.fov = 28;
                camera.updateProjectionMatrix();
                const fov = camera.fov * (Math.PI / 180);
                let distance = Math.abs(focusSize / (2 * Math.tan(fov / 2)));
                distance = Math.max(distance * 0.7, 0.2);
                camera.position.set(focusCenter.x, focusCenter.y + focusSize * 0.12, distance * 1.4);
                camera.near = 0.01;
                camera.far = Math.max(camera.far, distance * 4);
                camera.updateProjectionMatrix();
                camera.lookAt(focusCenter);

                // morph targets
                const morphs: THREE.Mesh[] = [];
                model.traverse((child) => {
                    // @ts-ignore
                    if (child.isMesh && child.morphTargetInfluences) morphs.push(child as THREE.Mesh);
                });
                morphMeshesRef.current = morphs;

                // animations
                if (gltf.animations && gltf.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(model);
                    const idle =
                        gltf.animations.find((a) => a.name.toLowerCase().includes("idle")) || gltf.animations[0];
                    if (idle) mixer.clipAction(idle).play();
                    mixerRef.current = mixer;
                }

                setModelLoaded(true);
                setModelStatus(null);
            },
            (xhr) => setModelStatus(`Načítání 3D modelu... ${Math.round((xhr.loaded / (xhr.total || 1)) * 100)}%`),
            (err) => {
                console.error("GLTF load error", err);
                setModelStatus("Chyba načítání modelu");
            }
        );

        const animate = () => {
            rafRef.current = requestAnimationFrame(animate);
            const delta = clockRef.current.getDelta();
            if (mixerRef.current) mixerRef.current.update(delta);
            updateMouthAndBlink(delta);
            renderer.render(scene, camera);
        };
        animate();

        const onResize = () => {
            if (!canvasHostRef.current || !cameraRef.current || !rendererRef.current) return;
            const w = canvasHostRef.current.clientWidth;
            const h = canvasHostRef.current.clientHeight;
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(w, h);
        };
        window.addEventListener("resize", onResize);
    }

    function cleanup() {
        stopSpeaking();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (rendererRef.current) {
            rendererRef.current.dispose();
            if (rendererRef.current.domElement.parentNode)
                rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current = null;
        sceneRef.current = null;
        cameraRef.current = null;
        mixerRef.current = null;
        modelRef.current = null;
        morphMeshesRef.current = [];
    }

    // ----------------------
    // Mouth & blink
    // ----------------------
    function setMouthOpen(value: number) {
        const morphs = morphMeshesRef.current;
        if (!morphs.length) return;
        morphs.forEach((mesh) => {
            const dict = (mesh as any).morphTargetDictionary as Record<string, number> | undefined;
            const infl = (mesh as any).morphTargetInfluences as number[] | undefined;
            if (!dict || !infl) return;
            if (dict["jawOpen"] !== undefined) infl[dict["jawOpen"]] = value * 0.9;
            if (dict["mouthOpen"] !== undefined) infl[dict["mouthOpen"]] = value * 0.6;
            if (dict["MouthOpen"] !== undefined) infl[dict["MouthOpen"]] = value * 0.6;
            if (dict["viseme_aa"] !== undefined) infl[dict["viseme_aa"]] = value * 0.35;
            if (dict["viseme_O"] !== undefined) infl[dict["viseme_O"]] = value * 0.25;
            if (dict["viseme_U"] !== undefined) infl[dict["viseme_U"]] = value * 0.25;
        });
    }

    function animateBlinkOnce() {
        morphMeshesRef.current.forEach((mesh) => {
            const dict = (mesh as any).morphTargetDictionary as Record<string, number> | undefined;
            const infl = (mesh as any).morphTargetInfluences as number[] | undefined;
            if (!dict || !infl) return;
            ["eyesClosed", "eyeBlinkLeft", "eyeBlinkRight", "eyeBlink"].forEach((n) => {
                if (dict[n] !== undefined) {
                    const idx = dict[n];
                    infl[idx] = 1.0;
                    setTimeout(() => (infl[idx] = 0), 120);
                }
            });
        });
    }

    function updateMouthAndBlink(delta: number) {
        blinkTimerRef.current += delta;
        if (blinkTimerRef.current > nextBlinkRef.current) {
            blinkTimerRef.current = 0;
            nextBlinkRef.current = 2 + Math.random() * 4;
            animateBlinkOnce();
        }
        if (isSpeaking && analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            let sum = 0;
            for (let i = 0; i < dataArrayRef.current.length; i++) sum += dataArrayRef.current[i];
            const avg = sum / dataArrayRef.current.length;
            const normalized = Math.min(avg / 255, 1);
            mouthOpenRef.current += (normalized * 0.9 - mouthOpenRef.current) * 0.25;
        } else if (isSpeaking) {
            mouthOpenRef.current += (0.2 + 0.25 * Math.abs(Math.sin(Date.now() * 0.02)) - mouthOpenRef.current) * 0.2;
        } else {
            mouthOpenRef.current *= 0.85;
            if (mouthOpenRef.current < 0.01) mouthOpenRef.current = 0;
        }
        setMouthOpen(mouthOpenRef.current);
    }

    // ----------------------
    // Recording / STT / TTS
    // ----------------------
    const toggleRecordingCorrect = async () => {
        if (!isRecording) {
            try {
                setSttError(null);
                setRecordingText("");
                setModelStatus("Nahrávám...");
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                const chunks: BlobPart[] = [];
                mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
                mediaRecorder.onstop = async () => {
                    setIsRecording(false);
                    setModelStatus("Zpracovávám audio...");
                    stream.getTracks().forEach((t) => t.stop());
                    const blob = new Blob(chunks, { type: "audio/webm" });
                    try {
                        await processAudio(blob);
                    } catch {
                        setSttError("Chyba STT / serveru");
                        setModelStatus(null);
                    }
                };
                mediaRecorder.start();
                setIsRecording(true);
            } catch {
                setSttError("Nelze získat přístup k mikrofonu");
                setModelStatus(null);
            }
        } else {
            mediaRecorderRef.current?.stop();
        }
    };

    async function processAudio(blob: Blob) {
        setModelStatus("Rozpoznávám řeč...");
        try {
            const form = new FormData();
            form.append("audio", blob, "audio.webm");
            const sttResponse = await fetch(API + "/stt", { method: "POST", body: form });
            const sttData = await sttResponse.json();
            if (sttData.error) {
                setSttError("Chyba rozpoznávání řeči");
                setModelStatus(null);
                return;
            }
            setRecordingText(sttData.text || "");
            await getAIResponseVoice(sttData.text || "");
        } catch {
            setSttError("Chyba STT / síť");
            setModelStatus(null);
        }
    }

    async function getAIResponseVoice(userText: string) {
        try {
            setModelStatus("Přemýšlím...");
            const resp = await fetch(API + "/__ai__?prompt=" + encodeURIComponent(userText) + "&session=" + SESSION_ID);
            const data = await resp.json();
            if (data?.output) await speak(data.output);
            else setModelStatus(null);
        } catch {
            setModelStatus(null);
        }
    }

    async function speak(text: string) {
        if (!text.trim()) return;
        setModelStatus("Mluvím...");
        setIsSpeaking(true);
        try {
            if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const audioCtx = audioCtxRef.current;
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512;
            analyserRef.current = analyser;
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

            const ttsResp = await fetch(API + "/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            if (!ttsResp.ok) throw new Error("TTS failed: " + ttsResp.status);
            const audioBuffer = await audioCtx.decodeAudioData(await ttsResp.arrayBuffer());
            stopSpeaking();

            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            sourceRef.current = source;

            source.start(0);
            const tick = () => {
                if (!isSpeaking || !analyserRef.current || !dataArrayRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                const arr = dataArrayRef.current;
                let sum = 0;
                for (let i = 0; i < arr.length; i++) sum += arr[i];
                const norm = Math.min((sum / arr.length) / 200, 1);
                mouthOpenRef.current += (norm * 1.0 - mouthOpenRef.current) * 0.35;
                requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);

            source.onended = () => {
                setIsSpeaking(false);
                setModelStatus(null);
                mouthOpenRef.current = 0;
                setMouthOpen(0);
                if (analyserRef.current) {
                    try { analyserRef.current.disconnect(); } catch {}
                    analyserRef.current = null;
                }
                sourceRef.current = null;
            };
        } catch {
            setIsSpeaking(false);
            setModelStatus(null);
        }
    }

    function stopSpeaking() {
        try {
            if (sourceRef.current) {
                try { sourceRef.current.onended = null; sourceRef.current.stop(); } catch {}
                try { sourceRef.current.disconnect(); } catch {}
                sourceRef.current = null;
            }
            if (analyserRef.current) {
                try { analyserRef.current.disconnect(); } catch {}
                analyserRef.current = null;
            }
        } finally {
            setIsSpeaking(false);
            setModelStatus(null);
            mouthOpenRef.current = 0;
            setMouthOpen(0);
        }
    }

    // ----------------------
    // UI
    // ----------------------
    const onMicClick = () => toggleRecordingCorrect();
    const onCancelClick = () => stopSpeaking();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-20 w-80 h-80 bg-[#86BC25]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#86BC25]/5 rounded-full blur-3xl" />
            </div>

            <section className="h-screen flex items-center justify-center px-8 pt-20 pb-8 relative z-10">
                <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-8 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative bg-black/5 rounded-3xl border-2 border-gray-200/40 overflow-hidden shadow-xl"
                        style={{ minHeight: "60vh" }}
                    >
                        <div ref={canvasHostRef} className="w-full h-full" style={{ minHeight: "60vh" }} />

                        <div className="absolute left-4 top-4 z-20">
                            {modelStatus && (
                                <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl text-sm font-semibold">
                                    {modelStatus}
                                </div>
                            )}
                        </div>

                        <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 z-20 transition-opacity ${isRecording ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                            <div className="inline-flex items-center gap-3 bg-red-600 text-white px-4 py-2 rounded-full font-semibold">
                                <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                                <span>Nahrávám…</span>
                            </div>
                        </div>

                        <div className="absolute bottom-6 right-6 z-20">
                            <button
                                onClick={onCancelClick}
                                disabled={!isSpeaking}
                                className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md transition ${
                                    isSpeaking ? "bg-gradient-to-r from-red-600 to-red-500 text-white" : "bg-gray-200 text-gray-700 opacity-60 cursor-not-allowed"
                                }`}
                            >
                                Zrušit mluvení
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="relative flex flex-col p-6 bg-white/70 backdrop-blur-2xl border-2 border-gray-200/50 rounded-3xl shadow-xl h-full">
                            <div className="mb-4">
                                <h2 className="text-2xl font-black" style={{ fontFamily: "Montserrat, sans-serif" }}>Video konzultace</h2>
                                <p className="text-sm text-gray-600 mt-1">Mluv s AI — stačí stisknout mikrofon a promluvit.</p>
                            </div>

                            <div className="flex-1 flex flex-col gap-4">
                                <div className="bg-white/40 rounded-2xl p-4 flex items-center gap-4 border border-gray-100">
                                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-3xl">🎓</div>
                                    <div>
                                        <div className="text-sm font-semibold">Školník</div>
                                        <div className="text-xs text-gray-600">Školní poradce — Plzeňský kraj</div>
                                    </div>
                                </div>

                                <div className="bg-white/60 rounded-xl p-3 border border-gray-100 h-40 overflow-auto">
                                    <div className="text-xs text-gray-500 mb-2">Přepis</div>
                                    <div className="text-sm text-gray-800 whitespace-pre-wrap">{recordingText || "Zatím bez přepisu — spusť nahrávání."}</div>
                                    {sttError && <div className="text-xs text-red-600 mt-2">{sttError}</div>}
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={onMicClick}
                                        className={`flex-1 px-4 py-3 rounded-xl font-bold text-white shadow-lg transition transform flex items-center justify-center gap-3 ${
                                            isRecording ? "bg-gradient-to-r from-red-600 to-red-500" : "bg-gradient-to-r from-black to-gray-900 hover:from-[#86BC25] hover:to-[#6a9c1d]"
                                        }`}
                                    >
                                        <span className="text-lg">{isRecording ? "Stop" : "Mikrofon"}</span>
                                        <span className="text-2xl">{isRecording ? "⏹️" : "🎤"}</span>
                                    </button>
                                </div>

                                <div className="text-xs text-gray-500">Status: <span className="font-semibold text-gray-700">{modelStatus || (modelLoaded ? "Ready" : "Načítání")}</span></div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};
