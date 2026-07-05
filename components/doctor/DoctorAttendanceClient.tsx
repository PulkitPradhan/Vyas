"use client";

import { useState } from "react";
import { useSync } from "@/lib/offline/sync-provider";

interface Props {
  facilityId: string;
  initialOpen: boolean;
  initialCheckIn?: string;
}

type Phase = "idle" | "locating" | "submitting" | "error";

export default function DoctorAttendanceClient({
  facilityId,
  initialOpen,
  initialCheckIn,
}: Props) {
  const { enqueue } = useSync();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  function getPosition(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        resolve(null); // unsupported — record with null coords, do not block
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null), // permission denied / timeout — proceed without
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    });
  }

  async function handleCheckIn() {
    setPhase("locating");
    setError(null);
    const geo = await getPosition();
    setPhase("submitting");

    // Optimistic: show checked-in immediately. Queue handles the actual write;
    // the offline queue (ADR-003) guarantees the row persists even on bad signal.
    setIsOpen(true);
    setCheckIn(new Date().toISOString());

    await enqueue(
      "workforce",
      "doctor.checkIn",
      {
        facilityId,
        geoLat: geo?.lat ?? null,
        geoLng: geo?.lng ?? null,
      },
      (res) => {
        if (!res.ok) {
          setIsOpen(false);
          setCheckIn(undefined);
          setPhase("error");
          setError(res.error ?? "Check-in failed");
        } else {
          setPhase("idle");
        }
      }
    );
  }

  async function handleCheckOut() {
    setPhase("submitting");
    setError(null);
    setIsOpen(false);
    setCheckIn(undefined);

    await enqueue("workforce", "doctor.checkOut", {}, (res) => {
      if (!res.ok) {
        setIsOpen(true);
        setCheckIn(initialCheckIn);
        setPhase("error");
        setError(res.error ?? "Check-out failed");
      } else {
        setPhase("idle");
      }
    });
  }

  const busy = phase === "locating" || phase === "submitting";

  return (
    <section className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center">
      <h1 className="text-lg font-semibold">Attendance</h1>
      {isOpen && checkIn ? (
        <p className="mt-1 text-sm text-gray-500">
          Checked in at {new Date(checkIn).toLocaleTimeString()}
        </p>
      ) : (
        <p className="mt-1 text-sm text-gray-500">Not checked in today</p>
      )}

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={isOpen ? handleCheckOut : handleCheckIn}
        disabled={busy}
        className={`mt-5 w-full rounded-lg px-4 py-4 text-lg font-semibold text-white disabled:opacity-50 ${
          isOpen ? "bg-critical hover:bg-red-700" : "bg-watch hover:bg-green-700"
        }`}
      >
        {busy ? (phase === "locating" ? "Locating…" : "Working…") : isOpen ? "Check Out" : "Check In"}
      </button>

      {phase === "locating" && (
        <p className="mt-2 text-xs text-gray-400">
          Capturing your location — the check-in will proceed even if permission
          is denied.
        </p>
      )}
    </section>
  );
}
