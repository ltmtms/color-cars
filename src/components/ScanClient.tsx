"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  canvasToPngBlob,
  extractCarFromCanvas,
  loadOpenCV,
} from "@/lib/opencv-extract";
import { apiUrl } from "@/lib/api-base";

type Step = "camera" | "preview" | "done";

export function ScanClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<Step>("camera");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [opencvReady, setOpencvReady] = useState(false);
  const [name, setName] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    loadOpenCV()
      .then(() => setOpencvReady(true))
      .catch(() => setError("Could not load OpenCV — try refreshing."));
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setError(
          "Camera access was blocked. Use Upload photo below, or allow camera on HTTPS."
        );
      }
    }
    if (step === "camera") start();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [step, stopCamera]);

  const grabFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = captureRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      setError("Camera not ready yet — wait a second and try again.");
      return;
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    return canvas;
  }, []);

  const runExtract = useCallback(async (source: HTMLCanvasElement) => {
    setLoading(true);
    setError(null);
    try {
      const out = await extractCarFromCanvas(source);
      const prev = previewRef.current;
      if (prev) {
        prev.width = out.width;
        prev.height = out.height;
        const ctx = prev.getContext("2d");
        ctx?.drawImage(out, 0, 0);
      }
      stopCamera();
      setStep("preview");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Extraction failed — try brighter light."
      );
    } finally {
      setLoading(false);
    }
  }, [stopCamera]);

  const onCapture = useCallback(async () => {
    const canvas = grabFrame();
    if (!canvas) return;
    if (!opencvReady) {
      setError("OpenCV still loading…");
      return;
    }
    await runExtract(canvas);
  }, [grabFrame, opencvReady, runExtract]);

  const onFile = useCallback(
    async (file: File) => {
      if (!opencvReady) {
        setError("OpenCV still loading…");
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = async () => {
        const canvas = captureRef.current;
        if (!canvas) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d")?.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        await runExtract(canvas);
      };
      img.onerror = () => setError("Could not read that image.");
      img.src = url;
    },
    [opencvReady, runExtract]
  );

  const onSubmit = useCallback(async () => {
    const canvas = previewRef.current;
    if (!canvas) return;
    setLoading(true);
    setError(null);
    try {
      const blob = await canvasToPngBlob(canvas);
      const form = new FormData();
      form.append("image", blob, "car.png");
      if (name.trim()) form.append("displayName", name.trim());
      const res = await fetch(apiUrl("/api/cars"), { method: "POST", body: form });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Upload failed");
      }
      const data = await res.json();
      setSubmittedId(data.id);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }, [name]);

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-800 text-center mb-2">
        Scan your car
      </h1>
      <p className="text-center text-slate-600 text-sm mb-6">
        Fill the frame with your coloured paper. OpenCV finds the dark outline
        and cuts the background away.
      </p>

      {error && (
        <p className="mb-4 rounded-xl bg-rose-100 text-rose-800 text-sm px-4 py-3" role="alert">
          {error}
        </p>
      )}

      {step === "camera" && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] ring-4 ring-rose-200">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-xs text-center text-slate-500">
            {opencvReady ? "OpenCV ready" : "Loading OpenCV…"}
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={onCapture}
            className="w-full rounded-2xl bg-rose-500 text-white font-bold py-4 shadow-lg disabled:opacity-50"
          >
            {loading ? "Cutting out car…" : "Snap & extract"}
          </button>
          <label className="block text-center">
            <span className="text-sm text-rose-600 font-semibold cursor-pointer underline">
              Upload a photo instead
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
            />
          </label>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <div
            className="rounded-2xl p-4 bg-[url('/checker.png')] bg-repeat aspect-[4/3] flex items-center justify-center ring-4 ring-amber-200"
            style={{
              backgroundImage:
                "linear-gradient(45deg,#eee 25%,transparent 25%),linear-gradient(-45deg,#eee 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eee 75%),linear-gradient(-45deg,transparent 75%,#eee 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
            }}
          >
            <canvas ref={previewRef} className="max-w-full max-h-64 object-contain" />
          </div>
          <input
            type="text"
            placeholder="Driver name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-rose-200 px-4 py-3"
            maxLength={40}
          />
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold"
              onClick={() => {
                setStep("camera");
                setError(null);
              }}
            >
              Retake
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onSubmit}
              className="flex-1 rounded-xl bg-amber-400 font-bold py-3 disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send to parade"}
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold text-emerald-600">You&apos;re in the parade!</p>
          <Link
            href="/showcase"
            className="inline-block rounded-2xl bg-rose-500 text-white font-bold px-8 py-4"
          >
            Open showcase
          </Link>
          <button
            type="button"
            className="block mx-auto text-sm text-slate-500 underline"
            onClick={() => {
              setStep("camera");
              setSubmittedId(null);
              setName("");
            }}
          >
            Scan another car
          </button>
          {submittedId && (
            <p className="text-xs text-slate-400">Car id: {submittedId}</p>
          )}
        </div>
      )}

      <canvas ref={captureRef} className="hidden" />
    </div>
  );
}
