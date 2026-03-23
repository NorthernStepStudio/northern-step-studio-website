import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Eye, MousePointer } from "lucide-react";

interface AnalyticsData {
  totalEvents: number;
  uniqueUsers: number;
  topApps: { name: string; count: number }[];
  eventsByType: { name: string; value: number }[];
  dailyVisits: { date: string; visits: number }[];
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"1d" | "7d" | "30d" | "365d">("7d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card-dark-wise text-center py-12">
        <p className="text-muted-foreground font-normal">Loading analytics...</p>
      </div>
    );
  }

  const COLORS = ["#9FE870", "#4ADE80", "#22C55E", "#16A34A", "#15803D"];

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-1 sm:mb-2">Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground font-normal">
            Track performance across all products
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {(["1d", "7d", "30d", "365d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 rounded-full text-xs sm:text-sm font-black uppercase transition-all flex-1 sm:flex-initial ${
                timeRange === range
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {range === "1d" ? "Daily" : range === "7d" ? "Weekly" : range === "30d" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="card-dark-wise">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground font-normal">Total Events</p>
              <p className="text-xl sm:text-2xl font-black">{data?.totalEvents || 0}</p>
            </div>
          </div>
        </div>

        <div className="card-dark-wise">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground font-normal">Unique Users</p>
              <p className="text-xl sm:text-2xl font-black">{data?.uniqueUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="card-dark-wise">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <MousePointer className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground font-normal">Avg Daily</p>
              <p className="text-xl sm:text-2xl font-black">
                {data?.dailyVisits?.length
                  ? Math.round(
                      data.dailyVisits.reduce((sum, d) => sum + d.visits, 0) /
                        data.dailyVisits.length
                    )
                  : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card-dark-wise">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground font-normal">Top App</p>
              <p className="text-sm sm:text-base font-black truncate">
                {data?.topApps?.[0]?.name || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Daily Visits Chart */}
        <div className="card-dark-wise">
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-4">Daily Visits</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data?.dailyVisits || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2B2B2B" />
              <XAxis
                dataKey="date"
                stroke="#6B6B6B"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#6B6B6B" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1C1C1C",
                  border: "1px solid #2B2B2B",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="#9FE870"
                strokeWidth={2}
                dot={{ fill: "#9FE870", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Event Types Pie Chart */}
        <div className="card-dark-wise">
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-4">Event Types</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.eventsByType || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(data?.eventsByType || []).map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1C1C1C",
                  border: "1px solid #2B2B2B",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Apps Table */}
      <div className="card-dark-wise">
        <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-4">Top Apps</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data?.topApps || []} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#2B2B2B" />
            <XAxis type="number" stroke="#6B6B6B" style={{ fontSize: "12px" }} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#6B6B6B"
              style={{ fontSize: "12px" }}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1C1C1C",
                border: "1px solid #2B2B2B",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="count" fill="#9FE870" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
