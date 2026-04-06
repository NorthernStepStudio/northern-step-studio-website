"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { formatCurrency, getDocumentCount } from "@/lib/appData";
import { useAppSnapshot } from "@/lib/useAppSnapshot";

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m4.5 10 3 3 7-7" />
    </svg>
  );
}

export default function InventoryPage() {
  const { t } = useTranslation();
  const { data, loading, error } = useAppSnapshot();
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [missingProofOnly, setMissingProofOnly] = useState(false);

  useEffect(() => {
    if (!selectedHomeId && data?.homes[0]?.id) {
      setSelectedHomeId(data.homes[0].id);
    }
  }, [data?.homes, selectedHomeId]);

  const scopedRooms = data?.rooms.filter((room) => room.home_id === selectedHomeId) ?? [];
  const scopedItems =
    data?.items.filter((item) => item.rooms?.home_id === selectedHomeId) ?? [];
  const categories = Array.from(
    new Set(scopedItems.map((item) => item.category).filter(Boolean)),
  ) as string[];

  const filteredItems = scopedItems.filter((item) => {
    const matchesSearch =
      !search ||
      [
        item.name,
        item.category,
        item.brand,
        item.rooms?.name,
        item.model,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesRoom = roomFilter === "all" || item.room_id === roomFilter;
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesProof = !missingProofOnly || getDocumentCount(item) === 0;

    return matchesSearch && matchesRoom && matchesCategory && matchesProof;
  });

  if (loading) {
    return (
      <div className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-6 shadow-sm">
        <p className="text-sm text-[color:var(--muted)]">Loading inventory…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-[color:var(--danger)]/20 bg-[color:var(--card)] p-6 shadow-sm">
        <p className="text-sm font-semibold text-[color:var(--danger)]">Inventory unavailable</p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          {t("inventory.label")}
        </p>
        <h1 className="text-3xl font-semibold">{t("inventory.title")}</h1>
        <p className="text-sm text-[color:var(--muted)]">
          {t("inventory.subtitle")}
        </p>
      </header>

      {data && data.homes.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {data.homes.map((home) => {
            const active = home.id === selectedHomeId;

            return (
              <button
                key={home.id}
                className="rounded-full border px-3 py-1 text-xs font-semibold"
                onClick={() => setSelectedHomeId(home.id)}
                style={{
                  borderColor: active ? "var(--accent)" : "var(--card-border)",
                  backgroundColor: active ? "var(--accent-soft)" : "var(--chip)",
                  color: active ? "var(--accent)" : "var(--foreground)",
                }}
              >
                {home.name}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card)] px-4 py-3">
          <span className="text-sm text-[color:var(--muted)]">
            {t("common.search")}
          </span>
          <input
            className="flex-1 bg-transparent text-sm outline-none"
            placeholder={t("inventory.searchPlaceholder")}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full border border-black/10 bg-[color:var(--chip)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]"
            onClick={() => {
              setRoomFilter("all");
              setCategoryFilter("all");
              setMissingProofOnly(false);
            }}
          >
            All items
          </button>
          {scopedRooms.map((room) => (
            <button
              key={room.id}
              className="rounded-full border border-black/10 bg-[color:var(--chip)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]"
              onClick={() => setRoomFilter(room.id)}
            >
              {room.name}
            </button>
          ))}
          {categories.map((category) => (
            <button
              key={category}
              className="rounded-full border border-black/10 bg-[color:var(--chip)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]"
              onClick={() => setCategoryFilter(category)}
            >
              {category}
            </button>
          ))}
          <button
            className="rounded-full border border-black/10 bg-[color:var(--chip)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]"
            onClick={() => setMissingProofOnly((current) => !current)}
          >
            {t("inventory.filters.missingProof")}
          </button>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card)] px-5 py-6 shadow-sm">
            <p className="text-sm text-[color:var(--muted)]">
              No items match the current filters.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card)] px-5 py-4 shadow-sm"
            >
              <div>
                <p className="text-base font-semibold">{item.name}</p>
                <p className="text-sm text-[color:var(--muted)]">
                  {item.rooms?.name || "Unassigned room"}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2 rounded-full bg-[color:var(--chip)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]">
                  <span className="text-[color:var(--accent)]">
                    <CheckIcon />
                  </span>
                  {t("inventory.proof")}: {getDocumentCount(item)}
                </span>
                <span className="text-sm font-semibold text-[color:var(--foreground)]">
                  {item.purchase_price != null
                    ? formatCurrency(item.purchase_price)
                    : t("common.valueTbd")}
                </span>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
