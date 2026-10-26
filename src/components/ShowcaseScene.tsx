"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  GALLERY_UPDATE_EVENT,
  listGalleryCars,
  type GalleryCar,
} from "@/lib/gallery-client";

type CarSprite = {
  id: string;
  imageUrl: string;
  displayName?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  scale: number;
};

export function ShowcaseScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cars, setCars] = useState<CarSprite[]>([]);
  const spritesRef = useRef<CarSprite[]>([]);
  const rafRef = useRef<number>(0);

  const mergeCars = useCallback((apiCars: GalleryCar[]) => {
    const box = containerRef.current?.getBoundingClientRect();
    const w = box?.width ?? 800;
    const h = box?.height ?? 500;
    const existing = new Map(spritesRef.current.map((c) => [c.id, c]));
    const next: CarSprite[] = apiCars.map((c, i) => {
      const old = existing.get(c.id);
      if (old) {
        return { ...old, imageUrl: c.imageUrl, displayName: c.displayName };
      }
      return {
        id: c.id,
        imageUrl: c.imageUrl,
        displayName: c.displayName,
        x: (w * 0.15) + (i % 5) * (w * 0.15) + Math.random() * 40,
        y: h * 0.45 + Math.random() * (h * 0.25),
        vx: (Math.random() - 0.5) * 1.2 + 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        angle: Math.random() * 10 - 5,
        spin: (Math.random() - 0.5) * 0.4,
        scale: 0.55 + Math.random() * 0.35,
      };
    });
    spritesRef.current = next;
    setCars(next);
  }, []);

  useEffect(() => {
    let alive = true;
    async function refresh() {
      try {
        const cars = await listGalleryCars();
        if (alive) mergeCars(cars);
      } catch {
        /* retry next tick */
      }
    }
    refresh();
    const id = setInterval(refresh, 2000);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "color-cars-gallery-v1") refresh();
    };
    const onCustom = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener(GALLERY_UPDATE_EVENT, onCustom);
    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(GALLERY_UPDATE_EVENT, onCustom);
    };
  }, [mergeCars]);

  useEffect(() => {
    const tick = () => {
      const el = containerRef.current;
      if (!el) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const w = el.clientWidth;
      const h = el.clientHeight;
      const roadY = h * 0.62;

      spritesRef.current = spritesRef.current.map((car) => {
        let { x, y, vx, vy, angle, spin } = car;
        x += vx;
        y += vy + Math.sin(Date.now() / 400 + car.id.length) * 0.15;
        angle += spin + vx * 0.8;

        const half = 60 * car.scale;
        if (x < half) {
          x = half;
          vx = Math.abs(vx);
        }
        if (x > w - half) {
          x = w - half;
          vx = -Math.abs(vx);
        }
        if (y < roadY - 80) {
          y = roadY - 80;
          vy = Math.abs(vy) * 0.5;
        }
        if (y > h - half) {
          y = h - half;
          vy = -Math.abs(vy) * 0.5;
        }

        return { ...car, x, y, vx, vy, angle };
      });
      setCars([...spritesRef.current]);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[min(70vh,520px)] rounded-3xl overflow-hidden shadow-inner border-4 border-white/80"
      aria-label="Animated car parade"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50" />
      <div
        className="absolute left-0 right-0 top-[18%] h-[28%] bg-gradient-to-b from-emerald-200 to-emerald-100 rounded-[50%] scale-x-125 -translate-y-1/2 opacity-90"
        aria-hidden
      />
      <div
        className="absolute left-0 right-0 top-[22%] h-[22%] bg-gradient-to-b from-emerald-100 to-transparent rounded-[50%] scale-x-110 -translate-y-1/3 opacity-70"
        aria-hidden
      />
      <div className="absolute bottom-0 left-0 right-0 h-[38%] bg-gradient-to-b from-amber-100 to-amber-200/90" />
      <div className="absolute bottom-[22%] left-0 right-0 h-3 bg-white/50 rounded-full mx-8" />
      <div className="absolute bottom-[18%] left-0 right-0 flex justify-center gap-2 opacity-40">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-8 h-1 bg-amber-600 rounded-full" />
        ))}
      </div>
      <p className="absolute top-4 left-4 right-4 text-center text-sm font-bold text-sky-800/80 drop-shadow">
        Sunny rolling road — new scans pop in every few seconds!
      </p>

      {cars.map((car) => (
        <div
          key={car.id}
          className="absolute will-change-transform pointer-events-none"
          style={{
            left: car.x,
            top: car.y,
            transform: `translate(-50%, -50%) rotate(${car.angle}deg) scale(${car.scale})`,
          }}
        >
          <img
            src={car.imageUrl}
            alt={car.displayName ?? "Coloured car"}
            className="w-32 h-auto drop-shadow-lg animate-[bounce-gentle_2s_ease-in-out_infinite]"
            style={{ animationDelay: `${(car.id.charCodeAt(0) % 10) * 0.1}s` }}
          />
          {car.displayName && (
            <span className="block text-center text-[10px] font-bold text-rose-700 -mt-1">
              {car.displayName}
            </span>
          )}
        </div>
      ))}

      {cars.length === 0 && (
        <p className="absolute inset-0 flex items-center justify-center text-slate-600 font-semibold">
          Loading cute cars…
        </p>
      )}
    </div>
  );
}
