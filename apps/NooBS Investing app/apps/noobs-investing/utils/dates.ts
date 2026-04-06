export function getWeekStartISO(d = new Date()) {
    const date = new Date(d);
    const day = date.getDay(); // 0 Sun, 1 Mon, ...
    const diff = (day + 6) % 7; // distance to Monday
    date.setDate(date.getDate() - diff);
    date.setHours(0, 0, 0, 0);
    return date.toISOString().slice(0, 10);
}
