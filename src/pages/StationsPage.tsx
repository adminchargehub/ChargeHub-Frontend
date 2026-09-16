import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "@/api/client";

export default function StationsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["stations"],
    queryFn: api.listStations,
  });

  if (isLoading) return <p className="muted">Loading stations…</p>;
  if (error) return <p className="error">{(error as Error).message}</p>;
  if (!data?.length) {
    return (
      <div className="card empty">
        <h2>No stations yet</h2>
        <p className="muted">
          Run <code>python -m scripts.seed</code> in the backend to create the University of
          Ibadan pilot station.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1>Stations</h1>
      <div className="grid">
        {data.map((station) => (
          <Link key={station.id} to={`/stations/${station.id}`} className="card station-card">
            <h2>{station.name}</h2>
            {station.address && <p className="muted">{station.address}</p>}
            <span className={station.is_active ? "pill pill-ok" : "pill pill-off"}>
              {station.is_active ? "Active" : "Inactive"}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
