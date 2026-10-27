"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  GALLERY_UPDATE_EVENT,
  listGalleryCars,
  type GalleryCar,
} from "@/lib/gallery-client";
import { CartoonRoadMap } from "@/components/CartoonRoadMap";
import {
  ROAD_PATHS,
  ROAD_VIEWBOX,
  samplePath,
  type RoadPath,
} from "@/lib/road-paths";

type CarOnRoad = {
  id: string;
  imageUrl: string;
  displayName?: string;
  pathId: string;
  pathT: number;
  speed: number;
  bob: number;
  scale: number;
};

function pathById(id: string): RoadPath {
  return ROAD_PATHS.find((p) => p.id === id) ?? ROAD_PATHS[0];
}

export function ShowcaseScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderCars, setRenderCars] = useState<
    { id: string; imageUrl: string; displayName?: string; left: number; top: number; angle: number; bob: number; scale: number }[]
  >([]);
  const carsRef = useRef<CarOnRoad[]>([]);
  const rafRef = useRef(0);
  const lastTs = useRef(0);

  const mergeCars = useCallback((gallery: GalleryCar[]) => {
    const existing = new Map(carsRef.current.map((c) => [c.id, c]));
    const next: CarOnRoad[] = gallery.map((c, i) => {
      const old = existing.get(c.id);
      if (old) {
        return { ...old, imageUrl: c.imageUrl, displayName: c.displayName };
      }
      const path = ROAD_PATHS[i % ROAD_PATHS.length];
      return {
        id: c.id,
        imageUrl: c.imageUrl,
        displayName: c.displayName,
        pathId: path.id,
        pathT: (i * 0.17) % 1,
        speed: 0.035 + (i % 5) * 0.008,
        bob: Math.random() * Math.PI * 2,
        scale: 0.5 + (i % 4) * 0.08,
      };
    });
    carsRef.current = next;
  }, []);

  useEffect(() => {
    let alive = true;
    async function refresh() {
      try {
        const cars = await listGalleryCars();
        if (alive) mergeCars(cars);
      } catch {
        /* retry */
      }
    }
    refresh();
    const id = setInterval(refresh, 2000);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "color-cars-gallery-v1") refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(GALLERY_UPDATE_EVENT, refresh);
    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(GALLERY_UPDATE_EVENT, refresh);
    };
  }, [mergeCars]);

  useEffect(() => {
    const tick = (ts: number) => {
      const dt = lastTs.current ? (ts - lastTs.current) / 1000 : 0;
      lastTs.current = ts;
      const el = containerRef.current;
      if (!el) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const w = el.clientWidth;
      const h = el.clientHeight;
      const sx = w / ROAD_VIEWBOX.w;
      const sy = h / ROAD_VIEWBOX.h;

      carsRef.current = carsRef.current.map((car) => {
        const closed = car.pathId === "park-loop";
        let pathT = car.pathT + car.speed * dt;
        let speed = car.speed;
        if (closed) {
          pathT = ((pathT % 1) + 1) % 1;
        } else {
          if (pathT > 1) {
            pathT = 1;
            speed = -Math.abs(speed);
          } else if (pathT < 0) {
            pathT = 0;
            speed = Math.abs(speed);
          }
        }
        return { ...car, pathT, speed, bob: car.bob + dt * 4 };
      });

      setRenderCars(
        carsRef.current.map((car) => {
          const path = pathById(car.pathId);
          const closed = car.pathId !== "main-avenue" && car.pathId !== "hill-cut";
          const { x, y, angle } = samplePath(path.points, car.pathT, closed);
          const bobY = Math.sin(car.bob) * 3;
          return {
            id: car.id,
            imageUrl: car.imageUrl,
            displayName: car.displayName,
            left: x * sx,
            top: y * sy + bobY,
            angle: angle + 90,
            bob: car.bob,
            scale: car.scale,
          };
        })
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[min(72vh,560px)] rounded-3xl overflow-hidden shadow-inner border-4 border-white/80 bg-sky-100"
      aria-label="Cartoon road parade"
    >
      <CartoonRoadMap />
      <p className="absolute top-3 left-3 right-3 z-10 text-center text-sm font-bold text-emerald-900/80 drop-shadow-sm pointer-events-none">
        Cartoon town roads — coloured cars drive the loops!
      </p>

      {renderCars.map((car) => (
        <div
          key={car.id}
          className="absolute z-20 pointer-events-none will-change-transform"
          style={{
            left: car.left,
            top: car.top,
            transform: `translate(-50%, -50%) rotate(${car.angle}deg) scale(${car.scale})`,
          }}
        >
          <img
            src={car.imageUrl}
            alt={car.displayName ?? "Coloured car"}
            className="w-20 sm:w-24 h-auto drop-shadow-md"
            draggable={false}
          />
          {car.displayName && (
            <span
              className="block text-center text-[9px] font-bold text-rose-800 bg-white/70 rounded-full px-1 -mt-0.5"
              style={{ transform: `rotate(${-car.angle}deg)` }}
            >
              {car.displayName}
            </span>
          )}
        </div>
      ))}

      {renderCars.length === 0 && (
        <p className="absolute inset-0 z-10 flex items-center justify-center text-slate-700 font-semibold">
          Loading demo cars onto the road…
        </p>
      )}
    </div>
  );
}
