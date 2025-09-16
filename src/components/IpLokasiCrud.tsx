"use client";
import { useEffect, useState } from "react";

export default function IpLokasiCrud() {
  const [data, setData] = useState<any[]>([]);
  const [ip, setIp] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const res = await fetch("/api/ip-lokasi");
    setData(await res.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    setLoading(true);
    await fetch("/api/ip-lokasi", {
      method: "POST",
      body: JSON.stringify({ ip, lokasi }),
      headers: { "Content-Type": "application/json" },
    });
    setIp("");
    setLokasi("");
    fetchData();
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    await fetch(`/api/ip-lokasi/${id}`, { method: "DELETE" });
    fetchData();
    setLoading(false);
  };

  return (
    <div>
      <h2>Daftar IP Jaringan Kantor</h2>
      <ul>
        {data.map((row) => (
          <li key={row.id}>
            {row.ip} - {row.lokasi}
            <button onClick={() => handleDelete(row.id)}>Hapus</button>
          </li>
        ))}
      </ul>
      <input
        value={ip}
        onChange={(e) => setIp(e.target.value)}
        placeholder="IP Address"
      />
      <input
        value={lokasi}
        onChange={(e) => setLokasi(e.target.value)}
        placeholder="Lokasi"
      />
      <button onClick={handleAdd} disabled={loading}>
        Tambah
      </button>
    </div>
  );
}
