import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const API = "http://localhost:5000";
const AVATAR_FILE = "/brunette.glb";

export const Chat3D = () => {
    const canvasHostRef = useRef<HTMLDivElement>(null);

    // Three.js refs
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);
    const modelRef = useRef<THREE.Object3D | null>(null);
    const morphMeshesRef = useRef<THREE.Mesh[]>([]);
    const clockRef = useRef(new THREE.Clock());
    const rafRef = useRef<number>(0);

    // Animation state
    const mouthOpenValueRef = useRef(0);
    const blinkTimerRef = useRef(0);
    const nextBlinkTimeRef = useRef(3);

    // Realtime API refs
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

    // State
    const [modelLoaded, setModelLoaded] = useState(false);
    const [modelStatus, setModelStatus] = useState<string | null>("Načítání 3D modelu...");
    const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
    const [isPushingToTalk, setIsPushingToTalk] = useState(false);
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [recordingText, setRecordingText] = useState("Připojeno");

    const isSpeakingRef = useRef(false);
    const mouseDownTimeRef = useRef(0);
    const greetingSentRef = useRef(false);
    const lastAudioDetectedRef = useRef(0);
    const forceUnlockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ============================================
    // THREE.JS SCENE INITIALIZATION
    // ============================================
    useEffect(() => {
        if (!canvasHostRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            30,
            canvasHostRef.current.clientWidth / canvasHostRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 1.5, 1.2);
        camera.lookAt(0, 1.5, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(canvasHostRef.current.clientWidth, canvasHostRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;
        canvasHostRef.current.appendChild(renderer.domElement);

        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
        keyLight.position.set(1, 2, 2);
        scene.add(keyLight);
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(-1, 1, 2);
        scene.add(fillLight);

        // Load model
        const loader = new GLTFLoader();
        loader.load(
            AVATAR_FILE,
            (gltf) => {
                const model = gltf.scene;
                scene.add(model);
                modelRef.current = model;

                // Find morph meshes
                const morphs: THREE.Mesh[] = [];
                model.traverse((child) => {
                    if ((child as any).isMesh && (child as any).morphTargetInfluences) {
                        morphs.push(child as THREE.Mesh);
                    }
                });
                morphMeshesRef.current = morphs;

                // Animations
                if (gltf.animations && gltf.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(model);
                    const idle = gltf.animations.find(a => a.name.toLowerCase().includes('idle')) || gltf.animations[0];
                    if (idle) mixer.clipAction(idle).play();
                    mixerRef.current = mixer;
                }

                setModelLoaded(true);
                setModelStatus(null);
            },
            (xhr) => {
                const percent = Math.round((xhr.loaded / (xhr.total || 1)) * 100);
                setModelStatus(`Načítání... ${percent}%`);
            },
            (err) => {
                console.error('Model load error:', err);
                setModelStatus('Chyba načítání modelu');
            }
        );

        // Animation loop
        const animate = () => {
            rafRef.current = requestAnimationFrame(animate);
            const delta = clockRef.current.getDelta();

            if (mixerRef.current) mixerRef.current.update(delta);

            animateMouth();
            animateBlink(delta);

            // Subtle head movement when speaking
            if (modelRef.current && isSpeakingRef.current) {
                modelRef.current.rotation.y = Math.sin(Date.now() * 0.002) * 0.03;
                modelRef.current.rotation.x = Math.sin(Date.now() * 0.0015) * 0.01;
            } else if (modelRef.current) {
                modelRef.current.rotation.y *= 0.95;
                modelRef.current.rotation.x *= 0.95;
            }

            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        animate();

        // Resize handler
        const handleResize = () => {
            if (!canvasHostRef.current || !cameraRef.current || !rendererRef.current) return;
            const w = canvasHostRef.current.clientWidth;
            const h = canvasHostRef.current.clientHeight;
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (rendererRef.current) {
                rendererRef.current.dispose();
                if (rendererRef.current.domElement.parentNode) {
                    rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
                }
            }
            disconnectRealtime();
        };
    }, []);

    // ============================================
    // DETAILED MOUTH ANIMATION
    // ============================================
    const setMouthOpen = (value: number, audioLevel = 0) => {
        const t = Date.now() * 0.006;
        const phonemeBlend = (Math.sin(t) + 1) / 2;
        const phoneme2 = (Math.sin(t * 1.7) + 1) / 2;
        const phoneme3 = (Math.sin(t * 0.8) + 1) / 2;
        const phoneme4 = (Math.sin(t * 2.3) + 1) / 2;

        morphMeshesRef.current.forEach(mesh => {
            const dict = (mesh as any).morphTargetDictionary as Record<string, number> | undefined;
            const infl = (mesh as any).morphTargetInfluences as number[] | undefined;
            if (!dict || !infl) return;

            // Base mouth opening
            if (dict['jawOpen'] !== undefined) infl[dict['jawOpen']] = value * 0.4;
            if (dict['mouthOpen'] !== undefined) infl[dict['mouthOpen']] = value * 0.45;

            // Jaw side movement
            const jawSide = Math.sin(t * 1.5) * 0.03 * value;
            if (dict['jawLeft'] !== undefined) infl[dict['jawLeft']] = Math.max(0, jawSide);
            if (dict['jawRight'] !== undefined) infl[dict['jawRight']] = Math.max(0, -jawSide);

            // Phoneme blending - "A" sound
            if (dict['viseme_aa'] !== undefined) infl[dict['viseme_aa']] = value * phonemeBlend * 0.4;

            // "O" sound
            if (dict['viseme_O'] !== undefined) infl[dict['viseme_O']] = value * (1 - phonemeBlend) * 0.45;
            if (dict['mouthFunnel'] !== undefined) infl[dict['mouthFunnel']] = value * (1 - phonemeBlend) * 0.25;

            // "E/I" sound
            if (dict['viseme_E'] !== undefined) infl[dict['viseme_E']] = value * phoneme2 * 0.3;
            if (dict['viseme_I'] !== undefined) infl[dict['viseme_I']] = value * phoneme4 * 0.2;

            // "U" sound
            if (dict['viseme_U'] !== undefined) infl[dict['viseme_U']] = value * phoneme3 * 0.25;
            if (dict['mouthPucker'] !== undefined) infl[dict['mouthPucker']] = value * phoneme3 * 0.2;

            // Consonants
            if (dict['viseme_PP'] !== undefined) infl[dict['viseme_PP']] = value * phoneme4 * (1 - phoneme2) * 0.15;
            if (dict['viseme_FF'] !== undefined) infl[dict['viseme_FF']] = value * (1 - phoneme4) * phoneme3 * 0.12;

            // Smile
            const smileAmount = 0.1 + Math.sin(t * 0.4) * 0.05;
            if (dict['mouthSmileLeft'] !== undefined) infl[dict['mouthSmileLeft']] = value * smileAmount;
            if (dict['mouthSmileRight'] !== undefined) infl[dict['mouthSmileRight']] = value * smileAmount;

            // Eye squint with smile
            if (dict['eyeSquintLeft'] !== undefined) infl[dict['eyeSquintLeft']] = value * smileAmount * 0.3;
            if (dict['eyeSquintRight'] !== undefined) infl[dict['eyeSquintRight']] = value * smileAmount * 0.3;

            // Lip movement
            if (dict['mouthLowerDownLeft'] !== undefined) infl[dict['mouthLowerDownLeft']] = value * 0.18;
            if (dict['mouthLowerDownRight'] !== undefined) infl[dict['mouthLowerDownRight']] = value * 0.18;
            if (dict['mouthUpperUpLeft'] !== undefined) infl[dict['mouthUpperUpLeft']] = value * 0.1;
            if (dict['mouthUpperUpRight'] !== undefined) infl[dict['mouthUpperUpRight']] = value * 0.1;

            // Cheeks on loud sounds
            if (audioLevel > 0.08) {
                const cheekAmount = (audioLevel - 0.08) * 0.5;
                if (dict['cheekPuff'] !== undefined) infl[dict['cheekPuff']] = cheekAmount * 0.15;
                if (dict['cheekSquintLeft'] !== undefined) infl[dict['cheekSquintLeft']] = cheekAmount * 0.1;
                if (dict['cheekSquintRight'] !== undefined) infl[dict['cheekSquintRight']] = cheekAmount * 0.1;
            }

            // Eyebrows
            const browMove = Math.sin(t * 0.25) * 0.04;
            if (dict['browInnerUp'] !== undefined) infl[dict['browInnerUp']] = Math.max(0, browMove + 0.03);
            if (dict['browOuterUpLeft'] !== undefined) infl[dict['browOuterUpLeft']] = Math.max(0, browMove * 0.5);
            if (dict['browOuterUpRight'] !== undefined) infl[dict['browOuterUpRight']] = Math.max(0, browMove * 0.5);
        });
    };

    const resetMouth = () => {
        const morphsToReset = [
            'jawOpen', 'jawLeft', 'jawRight', 'mouthOpen',
            'viseme_aa', 'viseme_O', 'viseme_E', 'viseme_I', 'viseme_U',
            'viseme_PP', 'viseme_FF', 'mouthFunnel', 'mouthPucker',
            'mouthSmileLeft', 'mouthSmileRight',
            'mouthLowerDownLeft', 'mouthLowerDownRight',
            'mouthUpperUpLeft', 'mouthUpperUpRight',
            'eyeSquintLeft', 'eyeSquintRight',
            'cheekPuff', 'cheekSquintLeft', 'cheekSquintRight',
            'browInnerUp', 'browOuterUpLeft', 'browOuterUpRight'
        ];

        morphMeshesRef.current.forEach(mesh => {
            const dict = (mesh as any).morphTargetDictionary as Record<string, number> | undefined;
            const infl = (mesh as any).morphTargetInfluences as number[] | undefined;
            if (!dict || !infl) return;

            morphsToReset.forEach(name => {
                if (dict[name] !== undefined) {
                    infl[dict[name]] *= 0.85;
                    if (infl[dict[name]] < 0.01) infl[dict[name]] = 0;
                }
            });
        });
    };

    const animateMouth = () => {
        let audioLevel = 0;

        if (analyserRef.current && dataArrayRef.current && !isPushingToTalk) {
            try {
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                let sum = 0;
                for (let i = 2; i < 30; i++) {
                    sum += dataArrayRef.current[i];
                }
                audioLevel = sum / 28 / 255;
            } catch (e) {
                // ignore
            }
        }

        // Only animate mouth when we detect audio
        if (audioLevel > 0.03) {
            lastAudioDetectedRef.current = Date.now();

            const time = Date.now() * 0.008;
            const target = 0.1 + audioLevel * 2.0 +
                Math.sin(time) * 0.1 +
                Math.sin(time * 1.6) * 0.07;
            mouthOpenValueRef.current += (Math.max(0.05, Math.min(0.7, target)) - mouthOpenValueRef.current) * 0.5;

            setMouthOpen(mouthOpenValueRef.current, audioLevel);
        } else {
            // Gradually close mouth
            mouthOpenValueRef.current *= 0.85;
            if (mouthOpenValueRef.current < 0.01) mouthOpenValueRef.current = 0;
            resetMouth();
        }
    };

    const animateBlink = (delta: number) => {
        blinkTimerRef.current += delta;
        if (blinkTimerRef.current > nextBlinkTimeRef.current) {
            blinkTimerRef.current = 0;
            nextBlinkTimeRef.current = 2 + Math.random() * 4;

            morphMeshesRef.current.forEach(mesh => {
                const dict = (mesh as any).morphTargetDictionary as Record<string, number> | undefined;
                const infl = (mesh as any).morphTargetInfluences as number[] | undefined;
                if (!dict || !infl) return;

                const blinkTargets = ['eyesClosed', 'eyeBlinkLeft', 'eyeBlinkRight'];
                blinkTargets.forEach(name => {
                    if (dict[name] !== undefined) {
                        infl[dict[name]] = 1.0;
                        setTimeout(() => {
                            if (infl) infl[dict[name]] = 0;
                        }, 120);
                    }
                });
            });
        }
    };

    // ============================================
    // OPENAI REALTIME API
    // ============================================
    const connectRealtime = async () => {
        try {
            setModelStatus('Připojuji se...');

            const configRes = await fetch(`${API}/api/config`);
            const config = await configRes.json();

            if (!config.api_key) {
                throw new Error('Chybí API klíč');
            }

            const tokenRes = await fetch('https://api.openai.com/v1/realtime/sessions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.api_key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-realtime-preview-2024-12-17',
                    voice: 'shimmer'
                })
            });

            if (!tokenRes.ok) {
                throw new Error('Nepodařilo se získat token');
            }

            const tokenData = await tokenRes.json();
            const ephemeralKey = tokenData.client_secret.value;

            const pc = new RTCPeerConnection();
            peerConnectionRef.current = pc;

            const audioElement = document.createElement('audio');
            audioElement.autoplay = true;
            audioElement.setAttribute('playsinline', '');
            document.body.appendChild(audioElement);
            audioElementRef.current = audioElement;

            pc.ontrack = (e) => {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioContextRef.current = audioContext;

                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }

                const source = audioContext.createMediaStreamSource(e.streams[0]);
                sourceNodeRef.current = source;

                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                analyser.smoothingTimeConstant = 0.5;
                analyserRef.current = analyser;
                dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

                const gainNode = audioContext.createGain();
                gainNode.gain.value = 1.0;
                gainNodeRef.current = gainNode;

                source.connect(analyser);
                analyser.connect(gainNode);
                gainNode.connect(audioContext.destination);

                audioElement.srcObject = e.streams[0];
                audioElement.muted = true;
            };

            const micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            micStreamRef.current = micStream;
            pc.addTrack(micStream.getTracks()[0]);

            const dataChannel = pc.createDataChannel('oai-events');
            dataChannelRef.current = dataChannel;

            dataChannel.onopen = () => {
                dataChannel.send(JSON.stringify({
                    type: 'session.update',
                    session: {
                        modalities: ['text', 'audio'],
                        instructions: config.system_prompt,
                        voice: 'shimmer',
                        input_audio_format: 'pcm16',
                        output_audio_format: 'pcm16',
                        input_audio_transcription: {
                            model: 'whisper-1',
                            language: 'cs'
                        },
                        turn_detection: null
                    }
                }));

                setTimeout(() => sendGreeting(), 100);
            };

            dataChannel.onmessage = (e) => {
                const event = JSON.parse(e.data);
                handleRealtimeEvent(event);
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const sdpRes = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ephemeralKey}`,
                    'Content-Type': 'application/sdp'
                },
                body: offer.sdp
            });

            const answerSdp = await sdpRes.text();
            await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

            setIsRealtimeConnected(true);
            setModelStatus(null);
            setRecordingText('Připojeno - Drž a mluv');

        } catch (error) {
            console.error('Realtime error:', error);
            setModelStatus('Chyba: ' + (error as Error).message);
            setTimeout(() => disconnectRealtime(), 2000);
        }
    };

    const disconnectRealtime = () => {
        // Clear force unlock timeout
        if (forceUnlockTimeoutRef.current) {
            clearTimeout(forceUnlockTimeoutRef.current);
            forceUnlockTimeoutRef.current = null;
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(t => t.stop());
            micStreamRef.current = null;
        }
        if (audioElementRef.current) {
            audioElementRef.current.srcObject = null;
            audioElementRef.current.remove();
            audioElementRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        dataChannelRef.current = null;
        analyserRef.current = null;
        dataArrayRef.current = null;
        gainNodeRef.current = null;
        sourceNodeRef.current = null;

        setIsRealtimeConnected(false);
        isSpeakingRef.current = false;
        setIsPushingToTalk(false);
        setIsAISpeaking(false);
        greetingSentRef.current = false;
        setRecordingText('Připojeno');
        setModelStatus(null);
    };

    const sendGreeting = () => {
        if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open' || greetingSentRef.current) return;

        dataChannelRef.current.send(JSON.stringify({
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [{
                    type: 'input_text',
                    text: 'Pozdrav mě krátce a představ se jako Klára, přátelská školní poradkyně pro střední školy v Plzeňském kraji.'
                }]
            }
        }));
        dataChannelRef.current.send(JSON.stringify({ type: 'response.create' }));
        greetingSentRef.current = true;
    };

    const handleRealtimeEvent = (event: any) => {
        switch (event.type) {
            case 'session.created':
            case 'session.updated':
                if (!greetingSentRef.current) sendGreeting();
                break;

            case 'response.created':
            case 'response.output_item.added':
            case 'response.content_part.added':
            case 'response.audio.delta':
                // Clear any existing unlock timeout
                if (forceUnlockTimeoutRef.current) {
                    clearTimeout(forceUnlockTimeoutRef.current);
                    forceUnlockTimeoutRef.current = null;
                }

                if (!isAISpeaking) {
                    setIsAISpeaking(true);
                    isSpeakingRef.current = true;
                    setRecordingText('Klára mluví...');
                    console.log('🔒 AI started speaking');
                }
                break;

            case 'response.audio.done':
            case 'response.done':
                console.log('📡 API response done - scheduling unlock');
                isSpeakingRef.current = false;

                // Clear any existing timeout
                if (forceUnlockTimeoutRef.current) {
                    clearTimeout(forceUnlockTimeoutRef.current);
                }

                // Force unlock after audio finishes playing (longer delay)
                forceUnlockTimeoutRef.current = setTimeout(() => {
                    console.log('🔓 Force unlock - button enabled');
                    setIsAISpeaking(false);
                    setRecordingText('Drž a mluv');
                    lastAudioDetectedRef.current = 0;
                    mouthOpenValueRef.current = 0;
                    forceUnlockTimeoutRef.current = null;
                }, 2500);
                break;

            case 'response.cancelled':
                setIsAISpeaking(false);
                isSpeakingRef.current = false;
                setRecordingText('Drž a mluv');
                break;

            case 'conversation.item.input_audio_transcription.completed':
                console.log('User said:', event.transcript);
                break;

            case 'error':
                if (event.error?.code !== 'response_cancel_not_active') {
                    console.error('Realtime error:', event.error);
                }
                break;
        }
    };

    // ============================================
    // PUSH-TO-TALK HANDLERS
    // ============================================
    const startTalking = () => {
        mouseDownTimeRef.current = Date.now();

        if (!isRealtimeConnected || !dataChannelRef.current) return;
        if (isPushingToTalk || isAISpeaking) return;

        setIsPushingToTalk(true);
        setRecordingText('Poslouchám tě...');

        if (dataChannelRef.current.readyState === 'open') {
            dataChannelRef.current.send(JSON.stringify({ type: 'input_audio_buffer.clear' }));
        }
    };

    const stopTalking = () => {
        if (!isRealtimeConnected || !dataChannelRef.current || !isPushingToTalk) return;

        const holdTime = Date.now() - mouseDownTimeRef.current;
        if (holdTime < 200) {
            setIsPushingToTalk(false);
            return;
        }

        setIsPushingToTalk(false);
        setRecordingText('Zpracovávám...');

        if (dataChannelRef.current.readyState === 'open') {
            dataChannelRef.current.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
            dataChannelRef.current.send(JSON.stringify({ type: 'response.create' }));
        }
    };

    const handleMicClick = () => {
        if (!isRealtimeConnected) {
            connectRealtime();
        }
    };

    // ============================================
    // RENDER
    // ============================================
    // ...keep all imports and logic the same

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
            {/* Background bubbles */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-20 w-80 h-80 bg-green-100/30 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl" />
            </div>

            <section className="h-screen flex items-center justify-center px-8 pt-20 pb-8 relative z-10">
                <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-8 items-start">
                    {/* 3D Canvas */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative bg-white/90 rounded-3xl border border-gray-200 overflow-hidden shadow-xl"
                        style={{ minHeight: "70vh" }}
                    >
                        <div
                            ref={canvasHostRef}
                            className="w-full h-full"
                            style={{ minHeight: "70vh" }}
                        />

                        {/* Recording indicator */}
                        <div
                            className={`absolute top-6 left-1/2 transform -translate-x-1/2 z-20 transition-opacity ${
                                isPushingToTalk || isAISpeaking ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <div
                                className={`inline-flex items-center gap-3 px-4 py-2 rounded-full font-bold text-white ${
                                    isPushingToTalk ? "bg-red-500" : "bg-green-500"
                                }`}
                            >
                                <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                                <span>{isPushingToTalk ? "Nahrávám..." : "Mluvím..."}</span>
                            </div>
                        </div>

                        {/* Disconnect button */}
                        {isRealtimeConnected && (
                            <button
                                onClick={disconnectRealtime}
                                className="absolute top-4 right-4 z-20 bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition"
                            >
                                ✕ Odpojit
                            </button>
                        )}
                    </motion.div>

                    {/* Control Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="relative flex flex-col p-6 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-lg h-full">
                            <div className="mb-6">
                                <h2 className="text-3xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
                                    Video konzultace
                                </h2>
                                <p className="text-sm text-gray-600 mt-2">
                                    Stiskni mikrofon, drž a mluv. Pusť pro odpověď AI.
                                </p>
                            </div>

                            <div className="flex-1 flex flex-col gap-4">
                                {/* Avatar info card */}
                                <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-200 shadow-sm">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center text-3xl shadow-md">
                                        👩‍🎓
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">Klára</div>
                                        <div className="text-xs text-gray-500">Školní poradkyně — Plzeňský kraj</div>
                                    </div>
                                </div>

                                {/* Microphone button */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onMouseDown={startTalking}
                                        onMouseUp={stopTalking}
                                        onMouseLeave={() => { if (isPushingToTalk) stopTalking(); }}
                                        onTouchStart={(e) => { e.preventDefault(); startTalking(); }}
                                        onTouchEnd={(e) => { e.preventDefault(); stopTalking(); }}
                                        onClick={handleMicClick}
                                        disabled={isAISpeaking}
                                        className={`flex-1 px-6 py-4 rounded-2xl font-bold text-white shadow-md transition-all transform flex items-center justify-center gap-3 text-lg ${
                                            isAISpeaking
                                                ? "bg-gray-300 cursor-not-allowed opacity-60"
                                                : isPushingToTalk
                                                    ? "bg-red-500 scale-95"
                                                    : isRealtimeConnected
                                                        ? "bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 active:scale-95"
                                                        : "bg-gray-400 hover:bg-gray-500 active:scale-95"
                                        }`}
                                    >
                  <span className="text-3xl">
                    {isAISpeaking ? "⏳" : isPushingToTalk ? "🔴" : "🎤"}
                  </span>
                                        <span>
                    {isAISpeaking
                        ? "AI mluví..."
                        : isPushingToTalk
                            ? "Nahrávám"
                            : isRealtimeConnected
                                ? "Drž a mluv"
                                : "Připojit se"}
                  </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );

}