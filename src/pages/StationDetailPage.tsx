import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api, type AvailabilityResponse, type OutletOut } from "@/api/client";

const DURATIONS = [30, 60, 120, 240];

function outletClass(status: OutletOut["status"]): string {
  switch (status) {
    case "available":
      return "outlet outlet-free";
    case "in_use":
    case "reserved":
      return "outlet outlet-busy";
    case "fault":
    case "offline":
      return "outlet outlet-fault";
    default:
      return "outlet outlet-maint";
  }
}

function describeSlot(result: AvailabilityResponse): string {
  if (!result.available) return "No usable outlets at this station.";
  if ((result.wait_minutes ?? 0) <= 0) {
    return `Outlet ${result.outlet_index} is free now.`;
  }
  const when = result.starts_at ? new Date(result.starts_at) : null;
  return `Next free: outlet ${result.outlet_index} in ${result.wait_minutes} min${
    when ? ` (${when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` : ""
  }.`;
}

export default function StationDetailPage() {
  const { stationId = "" } = useParams();
  const [duration, setDuration] = useState(60);

  const station = useQuery({
    queryKey: ["station", stationId],
    queryFn: () => api.getStation(stationId),
    enabled: Boolean(stationId),
    // Live outlet status — the design doc targets <2 s. Polling is the
    // placeholder until the WebSocket/IoT Core feed exists.
    refetchInterval: 10_000,
  });

  const availability = useMutation({
    mutationFn: () => api.checkAvailability(stationId, { duration_minutes: duration }),
  });

  if (station.isLoading) return <p className="muted">Loading station…</p>;
  if (station.error) return <p className="error">{(station.error as Error).message}</p>;
  if (!station.data) return null;

  const s = station.data;

  return (
    <>
      <Link to="/stations" className="back">
        ← All stations
      </Link>

      <h1>{s.name}</h1>
      {s.address && <p className="muted">{s.address}</p>}

      <p className="stat">
        <strong>{s.outlets_free_now}</strong> of <strong>{s.outlets_total}</strong> outlets free
      </p>

      <section className="card">
        <h2>Outlets</h2>
        <div className="outlets">
          {s.outlets.map((o) => (
            <div key={o.id} className={outletClass(o.status)} title={o.status}>
              <span className="outlet-index">{o.index}</span>
              <span className="outlet-status">{o.status.replace("_", " ")}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Find me an outlet</h2>
        <div className="durations">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              className={d === duration ? "chip chip-on" : "chip"}
              onClick={() => setDuration(d)}
            >
              {d < 60 ? `${d} min` : `${d / 60} hr`}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => availability.mutate()}
          disabled={availability.isPending}
        >
          {availability.isPending ? "Checking…" : "Check availability"}
        </button>

        {availability.error && (
          <p className="error">{(availability.error as Error).message}</p>
        )}

        {availability.data && (
          <p className={availability.data.available ? "result result-ok" : "result result-none"}>
            {describeSlot(availability.data)}
          </p>
        )}
      </section>
    </>
  );
}
