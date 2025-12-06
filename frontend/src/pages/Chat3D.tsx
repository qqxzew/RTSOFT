// src/pages/Chat3D.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const API = "http://localhost:5000";
const AVATAR_FILE = "brunette.glb";
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
                // remove previous if any
                if (modelRef.current) {
                    scene.remove(modelRef.current);
                    modelRef.current = null;
                    morphMeshesRef.current = [];
                }

                const model = gltf.scene;
                scene.add(model);
                modelRef.current = model;

                // center model properly
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);

                // camera distance based on model size
                const size = box.getSize(new THREE.Vector3()).length();
                const fov = camera.fov * (Math.PI / 180);
                const distance = Math.abs(size / (2 * Math.tan(fov / 2)));
                // place camera slightly back and up to frame face
                camera.position.set(0, box.max.y * 0.4, distance * 1.25);
                camera.lookAt(0, box.max.y * 0.4, 0);

                // morph meshes (for mouth/blink)
                const morphs: THREE.Mesh[] = [];
                model.traverse((child) => {
                    // @ts-ignore
                    if (child.isMesh && child.morphTargetInfluences) {
                        morphs.push(child as THREE.Mesh);
                    }
                });
                morphMeshesRef.current = morphs;

                // animations (idle)
                if (gltf.animations && gltf.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(model);
                    const idle =
                        gltf.animations.find((a) =>
                            a.name.toLowerCase().includes("idle")
                        ) || gltf.animations[0];
                    if (idle) mixer.clipAction(idle).play();
                    mixerRef.current = mixer;
                }

                setModelLoaded(true);
                setModelStatus(null);
            },
            (xhr) => {
                // progress could be shown
                setModelStatus(`Načítání 3D modelu... ${Math.round((xhr.loaded / (xhr.total || 1)) * 100)}%`);
            },
            (err) => {
                console.error("GLTF load error", err);
                setModelStatus("Chyba načítání modelu");
            }
        );

        // animation loop
        const animate = () => {
            rafRef.current = requestAnimationFrame(animate);

            const delta = clockRef.current.getDelta();
            if (mixerRef.current) mixerRef.current.update(delta);

            // mouth / blink updates
            updateMouthAndBlink(delta);

            renderer.render(scene, camera);
        };
        animate();

        // handle resize
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
        // stop audio
        stopSpeaking();

        // cancel RAF
        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        // dispose renderer
        if (rendererRef.current) {
            rendererRef.current.dispose();
            if (rendererRef.current.domElement && rendererRef.current.domElement.parentNode) {
                rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
            }
        }
        rendererRef.current = null;
        sceneRef.current = null;
        cameraRef.current = null;
        mixerRef.current = null;
        modelRef.current = null;
        morphMeshesRef.current = [];
    }

    // ----------------------
    // mouth & blink helpers
    // ----------------------
    function setMouthOpen(value: number) {
        const morphs = morphMeshesRef.current;
        if (!morphs.length) return;

        morphs.forEach((mesh) => {
            const dict = (mesh as any).morphTargetDictionary as Record<string, number> | undefined;
            const influences = (mesh as any).morphTargetInfluences as number[] | undefined;
            if (!dict || !influences) return;

            // try several common morph names
            if (dict["jawOpen"] !== undefined) influences[dict["jawOpen"]] = value * 0.9;
            if (dict["mouthOpen"] !== undefined) influences[dict["mouthOpen"]] = value * 0.6;
            if (dict["MouthOpen"] !== undefined) influences[dict["MouthOpen"]] = value * 0.6;
            if (dict["viseme_aa"] !== undefined) influences[dict["viseme_aa"]] = value * 0.35;
            if (dict["viseme_O"] !== undefined) influences[dict["viseme_O"]] = value * 0.25;
            if (dict["viseme_U"] !== undefined) influences[dict["viseme_U"]] = value * 0.25;
        });
    }

    function animateBlinkOnce() {
        const morphs = morphMeshesRef.current;
        morphs.forEach((mesh) => {
            const dict = (mesh as any).morphTargetDictionary as Record<string, number> | undefined;
            const infl = (mesh as any).morphTargetInfluences as number[] | undefined;
            if (!dict || !infl) return;

            ["eyesClosed", "eyeBlinkLeft", "eyeBlinkRight", "eyeBlink"].forEach((n) => {
                if (dict[n] !== undefined) {
                    const idx = dict[n];
                    infl[idx] = 1.0;
                    setTimeout(() => {
                        infl[idx] = 0;
                    }, 120);
                }
            });
        });
    }

    function updateMouthAndBlink(delta: number) {
        // blink timer
        blinkTimerRef.current += delta;
        if (blinkTimerRef.current > nextBlinkRef.current) {
            blinkTimerRef.current = 0;
            nextBlinkRef.current = 2 + Math.random() * 4;
            animateBlinkOnce();
        }

        // mouth: take analyser data if speaking, else decay
        if (isSpeaking && analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            // compute average amplitude
            let sum = 0;
            for (let i = 0; i < dataArrayRef.current.length; i++) sum += dataArrayRef.current[i];
            const avg = sum / dataArrayRef.current.length;
            const normalized = Math.min(avg / 255, 1);
            // map to mouth open range
            mouthOpenRef.current += (normalized * 0.9 - mouthOpenRef.current) * 0.25;
        } else if (isSpeaking) {
            // fallback gentle oscillation while speaking
            mouthOpenRef.current += (0.2 + 0.25 * Math.abs(Math.sin(Date.now() * 0.02)) - mouthOpenRef.current) * 0.2;
        } else {
            // decay to 0
            mouthOpenRef.current *= 0.85;
            if (mouthOpenRef.current < 0.01) mouthOpenRef.current = 0;
        }

        setMouthOpen(mouthOpenRef.current);
    }

    // ----------------------
    // RECORDING -> STT -> AI -> TTS
    // ----------------------
    async function toggleRecording() {
        if (!isRecording) {
            try {
                setSttError(null);
                setRecordingText("");
                setModelStatus("Nahrávám...");
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                const chunks: BlobPart[] = [];

                mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
                mediaRecorder.onstop = async () => {
                    setIsRecording(false);
                    setModelStatus("Zpracovávám audio...");
                    // stop tracks
                    stream.getTracks().forEach((t) => t.stop());

                    const blob = new Blob(chunks, { type: "audio/webm" });
                    try {
                        await processAudio(blob);
                    } catch (err) {
                        console.error("processAudio error", err);
                        setSttError("Chyba STT / serveru");
                        setModelStatus(null);
                    }
                };

                mediaRecorder.start();
                setIsRecording(true);
                setModelStatus("Nahrávám...");
            } catch (err) {
                console.error("mic error", err);
                setSttError("Nelze získat přístup k mikrofonu");
                setModelStatus(null);
            }
        } else {
            // stop will trigger onstop
            // find active MediaRecorder from refs? We created a MediaRecorder local
            // we can stop all active tracks of getUserMedia, but easier: ask user to click again (we held mediaRecorder local)
            // To keep it simple: request new getUserMedia then immediately stop tracks (no)
            // We'll rely on the recorder.onstop handler above - but we need a reference to the recorder
            // to stop we stored it via closure above; to keep code consistent, we use a weak trick: call navigator.mediaDevices.getUserMedia and stop?
            // Simpler: toggleRecording will be called only once to start; user stops recording by clicking mic again: to do that we need the mediaRecorder ref.
            // For correctness: restructure to keep mediaRecorder in ref.
            // But since this branch is hit when isRecording=true, nothing to do here.
            // We'll implement mediaRecorderRef to manage stop properly below.
        }
    }

    // We'll implement mediaRecorder correctly using a ref so we can stop it above.
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    async function toggleRecordingCorrect() {
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
                    } catch (err) {
                        console.error("processAudio error", err);
                        setSttError("Chyba STT / serveru");
                        setModelStatus(null);
                    }
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error("mic error", err);
                setSttError("Nelze získat přístup k mikrofonu");
                setModelStatus(null);
            }
        } else {
            // stop recorder
            try {
                mediaRecorderRef.current?.stop();
            } catch (err) {
                console.warn("stop recorder failed", err);
            }
        }
    }

    async function processAudio(blob: Blob) {
        setModelStatus("Rozpoznávám řeč...");
        try {
            const form = new FormData();
            form.append("audio", blob, "audio.webm");
            const sttResponse = await fetch(API + "/stt", {
                method: "POST",
                body: form,
            });
            const sttData = await sttResponse.json();
            if (sttData.error) {
                console.error("STT error", sttData);
                setSttError("Chyba rozpoznávání řeči");
                setModelStatus(null);
                return;
            }
            setRecordingText(sttData.text || "");
            // get AI answer and speak
            await getAIResponseVoice(sttData.text || "");
        } catch (err) {
            console.error("processAudio fetch error", err);
            setSttError("Chyba STT / síť");
            setModelStatus(null);
        }
    }

    async function getAIResponseVoice(userText: string) {
        try {
            setModelStatus("Přemýšlím...");
            const resp = await fetch(API + "/__ai__?prompt=" + encodeURIComponent(userText) + "&session=" + SESSION_ID);
            const data = await resp.json();
            if (data?.output) {
                await speak(data.output);
            } else {
                setModelStatus(null);
            }
        } catch (err) {
            console.error("AI error", err);
            setModelStatus(null);
        }
    }

    // ----------------------
    // TTS + mouth animation via analyser
    // ----------------------
    async function speak(text: string) {
        if (!text || text.trim().length === 0) return;
        setModelStatus("Mluvím...");
        setIsSpeaking(true);

        try {
            if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const audioCtx = audioCtxRef.current;

            // create analyser
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512;
            analyserRef.current = analyser;
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

            // fetch TTS
            const ttsResp = await fetch(API + "/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            if (!ttsResp.ok) throw new Error("TTS failed: " + ttsResp.status);
            const arrayBuffer = await ttsResp.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

            // stop existing
            stopSpeaking();

            // create source
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;

            // connect: source -> analyser -> destination
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            sourceRef.current = source;

            // start sampling for mouth movement
            const startTime = audioCtx.currentTime;
            source.start(0);

            // poll analyser
            const tick = () => {
                if (!isSpeaking || !analyserRef.current || !dataArrayRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                // average amplitude
                let sum = 0;
                const arr = dataArrayRef.current;
                for (let i = 0; i < arr.length; i++) sum += arr[i];
                const avg = sum / arr.length;
                const norm = Math.min(avg / 200, 1); // reduce sensitivity
                mouthOpenRef.current += (norm * 1.0 - mouthOpenRef.current) * 0.35;
                // continue
                requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);

            source.onended = () => {
                setIsSpeaking(false);
                setModelStatus(null);
                mouthOpenRef.current = 0;
                setMouthOpen(0);
                // disconnect analyser
                if (analyserRef.current) {
                    try {
                        analyserRef.current.disconnect();
                    } catch {}
                    analyserRef.current = null;
                }
                sourceRef.current = null;
            };
        } catch (err) {
            console.error("speak error", err);
            setIsSpeaking(false);
            setModelStatus(null);
        }
    }

    function stopSpeaking() {
        try {
            // stop source if playing
            if (sourceRef.current) {
                try {
                    sourceRef.current.onended = null;
                    sourceRef.current.stop();
                } catch (e) {}
                try {
                    sourceRef.current.disconnect();
                } catch (e) {}
                sourceRef.current = null;
            }
            if (analyserRef.current) {
                try {
                    analyserRef.current.disconnect();
                } catch {}
                analyserRef.current = null;
            }
        } catch (e) {
            // ignore
        } finally {
            setIsSpeaking(false);
            setModelStatus(null);
            mouthOpenRef.current = 0;
            setMouthOpen(0);
        }
    }

    // UI actions
    const onMicClick = () => {
        // use the correct toggle that stores recorder
        toggleRecordingCorrect();
    };

    const onCancelClick = () => {
        stopSpeaking();
    };

    // ----------------------
    // Render
    // ----------------------
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
            {/* subtle green glows like landing */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-20 w-80 h-80 bg-[#86BC25]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#86BC25]/5 rounded-full blur-3xl" />
            </div>

            <section className="h-screen flex items-center justify-center px-8 pt-20 pb-8 relative z-10">
                <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-8 items-start">
                    {/* Left: 3D canvas */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative bg-black/5 rounded-3xl border-2 border-gray-200/40 overflow-hidden shadow-xl"
                        style={{ minHeight: "60vh" }}
                    >
                        <div ref={canvasHostRef} className="w-full h-full" style={{ minHeight: "60vh" }} />

                        {/* loading & model-status overlays */}
                        <div className="absolute left-4 top-4 z-20">
                            {modelStatus && (
                                <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl text-sm font-semibold">
                                    {modelStatus}
                                </div>
                            )}
                        </div>

                        {/* recording indicator */}
                        <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 z-20 transition-opacity ${isRecording ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                            <div className="inline-flex items-center gap-3 bg-red-600 text-white px-4 py-2 rounded-full font-semibold">
                                <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                                <span>Nahrávám…</span>
                            </div>
                        </div>

                        {/* speaking cancel */}
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

                    {/* Right: glass control card (matching landing style) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="relative flex flex-col p-6 bg-white/70 backdrop-blur-2xl border-2 border-gray-200/50 rounded-3xl shadow-xl h-full">
                            <div className="mb-4">
                                <h2 className="text-2xl font-black" style={{ fontFamily: "Montserrat, sans-serif" }}>
                                    Video konzultace
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">Mluv s AI — stačí stisknout mikrofon a promluvit.</p>
                            </div>

                            <div className="flex-1 flex flex-col gap-4">
                                {/* big visual area with small preview or avatar */}
                                <div className="bg-white/40 rounded-2xl p-4 flex items-center gap-4 border border-gray-100">
                                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-3xl">🎓</div>
                                    <div>
                                        <div className="text-sm font-semibold">Školník</div>
                                        <div className="text-xs text-gray-600">Školní poradce — Plzeňský kraj</div>
                                    </div>
                                </div>

                                {/* transcript */}
                                <div className="bg-white/60 rounded-xl p-3 border border-gray-100 h-40 overflow-auto">
                                    <div className="text-xs text-gray-500 mb-2">Přepis</div>
                                    <div className="text-sm text-gray-800 whitespace-pre-wrap">{recordingText || "Zatím bez přepisu — spusť nahrávání."}</div>
                                    {sttError && <div className="text-xs text-red-600 mt-2">{sttError}</div>}
                                </div>

                                {/* controls */}
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
