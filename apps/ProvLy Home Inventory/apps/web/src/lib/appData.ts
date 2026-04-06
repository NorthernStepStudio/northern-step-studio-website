import { createClient } from "@/utils/supabase/client";

export interface ProfileRecord {
  id: string;
  full_name: string | null;
  subscription_tier: string | null;
  ai_enabled: boolean | null;
  deleted_at?: string | null;
}

export interface HomeRecord {
  id: string;
  name: string;
  address: string | null;
  created_at: string | null;
}

export interface RoomRecord {
  id: string;
  home_id: string;
  name: string;
  room_type: string | null;
  created_at: string | null;
  parent_id?: string | null;
}

export interface DocumentRecord {
  id: string;
  item_id: string;
  file_type: string | null;
  doc_type: string | null;
  storage_path: string;
  original_name: string | null;
  created_at: string | null;
}

export interface ItemRecord {
  id: string;
  room_id: string;
  name: string;
  category: string | null;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  notes: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  rooms: RoomRecord | null;
  documents: DocumentRecord[];
}

export interface ExportJobRecord {
  id: string;
  home_id: string | null;
  status: string | null;
  format: string | null;
  storage_path: string | null;
  expires_at: string | null;
  created_at: string | null;
}

export interface MaintenanceTaskRecord {
  id: string;
  item_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  frequency_days: number | null;
  is_completed: boolean | null;
  completed_at: string | null;
}

export interface AppSnapshot {
  user: {
    id: string;
    email: string | null;
  };
  profile: ProfileRecord | null;
  homes: HomeRecord[];
  rooms: RoomRecord[];
  items: ItemRecord[];
  exportJobs: ExportJobRecord[];
}

function toRoomRecord(room: unknown): RoomRecord | null {
  if (!room || Array.isArray(room)) {
    return (Array.isArray(room) ? room[0] : null) as RoomRecord | null;
  }

  return room as RoomRecord;
}

function toItemRecord(item: Record<string, unknown>): ItemRecord {
  return {
    id: String(item.id),
    room_id: String(item.room_id),
    name: String(item.name),
    category: (item.category as string | null) ?? null,
    brand: (item.brand as string | null) ?? null,
    model: (item.model as string | null) ?? null,
    serial_number: (item.serial_number as string | null) ?? null,
    purchase_date: (item.purchase_date as string | null) ?? null,
    purchase_price:
      item.purchase_price == null ? null : Number(item.purchase_price),
    notes: (item.notes as string | null) ?? null,
    status: (item.status as string | null) ?? null,
    created_at: (item.created_at as string | null) ?? null,
    updated_at: (item.updated_at as string | null) ?? null,
    rooms: toRoomRecord(item.rooms),
    documents: Array.isArray(item.documents)
      ? (item.documents as DocumentRecord[])
      : [],
  };
}

export async function loadAppSnapshot(): Promise<AppSnapshot> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Please sign in again.");
  }

  const [profileResult, homesResult, roomsResult, itemsResult, exportJobsResult] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("homes").select("*").order("created_at", { ascending: true }),
      supabase.from("rooms").select("*").order("created_at", { ascending: true }),
      supabase
        .from("items")
        .select("*, rooms(*), documents(*)")
        .order("created_at", { ascending: false }),
      supabase
        .from("export_jobs")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

  const firstError =
    profileResult.error ||
    homesResult.error ||
    roomsResult.error ||
    itemsResult.error ||
    exportJobsResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    profile: profileResult.data,
    homes: homesResult.data ?? [],
    rooms: roomsResult.data ?? [],
    items: (itemsResult.data ?? []).map((item) =>
      toItemRecord(item as Record<string, unknown>),
    ),
    exportJobs: exportJobsResult.data ?? [],
  };
}

export async function loadItemDetails(itemId: string): Promise<{
  user: { id: string; email: string | null };
  item: ItemRecord | null;
  tasks: MaintenanceTaskRecord[];
}> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Please sign in again.");
  }

  const [itemResult, tasksResult] = await Promise.all([
    supabase
      .from("items")
      .select("*, rooms(*), documents(*)")
      .eq("id", itemId)
      .maybeSingle(),
    supabase
      .from("maintenance_tasks")
      .select("*")
      .eq("item_id", itemId)
      .order("due_date", { ascending: true }),
  ]);

  if (itemResult.error) {
    throw new Error(itemResult.error.message);
  }

  if (tasksResult.error) {
    throw new Error(tasksResult.error.message);
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    item: itemResult.data
      ? toItemRecord(itemResult.data as Record<string, unknown>)
      : null,
    tasks: tasksResult.data ?? [],
  };
}

export function formatCurrency(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) {
    return "Value TBD";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getDocumentCount(item: ItemRecord, docType?: string) {
  if (!docType) {
    return item.documents.length;
  }

  return item.documents.filter((document) => document.doc_type === docType).length;
}

export function isProofReady(item: ItemRecord) {
  return (
    getDocumentCount(item, "photo") > 0 &&
    Number(item.purchase_price || 0) > 0 &&
    Boolean(item.serial_number || item.model)
  );
}
