import { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface StripeSummary {
  configured?: boolean;
  availableBalance: number;
  pendingBalance: number;
  totalCustomers: number;
  monthlyRevenue: number;
  totalCharges: number;
  currency: string;
  recentPayments: RecentPayment[];
}

interface RecentPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description: string | null;
}

interface Subscription {
  id: string;
  status: string;
  created: number;
  current_period_end: number;
  customer: string;
  plan: string;
  amount: number;
  interval: string;
}

interface SubscriptionData {
  configured?: boolean;
  total: number;
  active: number;
  canceled: number;
  trialing: number;
  subscriptions: Subscription[];
}

interface Charge {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description: string | null;
  receipt_url: string | null;
}

interface PaymentData {
  configured?: boolean;
  charges: Charge[];
}

export default function Revenue() {
  const [summary, setSummary] = useState<StripeSummary | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData | null>(null);
  const [payments, setPayments] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "subscriptions">("overview");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, subsRes, paymentsRes] = await Promise.all([
        fetch("/api/stripe/summary"),
        fetch("/api/stripe/subscriptions"),
        fetch("/api/stripe/payments"),
      ]);

      if (!summaryRes.ok) throw new Error("Failed to fetch Stripe data");

      setSummary(await summaryRes.json());
      setSubscriptions(await subsRes.json());
      setPayments(await paymentsRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "succeeded":
      case "active":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "canceled":
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "trialing":
      case "pending":
      case "processing":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      succeeded: "bg-green-500/20 text-green-500",
      active: "bg-green-500/20 text-green-500",
      canceled: "bg-red-500/20 text-red-500",
      failed: "bg-red-500/20 text-red-500",
      trialing: "bg-blue-500/20 text-blue-500",
      pending: "bg-yellow-500/20 text-yellow-500",
      processing: "bg-yellow-500/20 text-yellow-500",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-hero mb-2">Revenue</h1>
          <p className="text-muted-foreground font-normal">Stripe payment analytics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-dark-wise animate-pulse h-28" />
          ))}
        </div>
        <div className="card-dark-wise animate-pulse h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-hero mb-2">Revenue</h1>
          <p className="text-muted-foreground font-normal">Stripe payment analytics</p>
        </div>
        <div className="card-dark-wise text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Unable to Load Stripe Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button onClick={fetchData} className="btn-pill-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (summary?.configured === false) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-hero mb-2">Revenue</h1>
          <p className="text-muted-foreground font-normal">Stripe payment analytics</p>
        </div>
        <div className="card-dark-wise text-center py-12">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Stripe Is Not Connected Yet</h3>
          <p className="text-muted-foreground mb-6">
            Revenue analytics will appear here once a Stripe secret key is configured for this site.
          </p>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noreferrer"
            className="btn-pill-primary inline-flex items-center gap-2"
          >
            Open Stripe Dashboard
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Available Balance",
      value: formatCurrency(summary?.availableBalance || 0, summary?.currency),
      subtext: `${formatCurrency(summary?.pendingBalance || 0, summary?.currency)} pending`,
      icon: DollarSign,
      gradient: "from-green-500/20 to-green-500/5",
      iconColor: "text-green-500",
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(summary?.monthlyRevenue || 0, summary?.currency),
      subtext: `${summary?.totalCharges || 0} transactions`,
      icon: TrendingUp,
      gradient: "from-accent/20 to-accent/5",
      iconColor: "text-accent",
    },
    {
      label: "Total Customers",
      value: summary?.totalCustomers?.toString() || "0",
      subtext: "All time",
      icon: Users,
      gradient: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
    },
    {
      label: "Active Subscriptions",
      value: subscriptions?.active?.toString() || "0",
      subtext: `${subscriptions?.trialing || 0} trialing`,
      icon: CreditCard,
      gradient: "from-purple-500/20 to-purple-500/5",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-hero">Revenue</h1>
            <span className="px-2.5 py-1 bg-purple-500/10 text-purple-500 text-xs font-bold uppercase rounded-full">
              Stripe
            </span>
          </div>
          <p className="text-muted-foreground font-normal">
            Payment analytics and subscription data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pill-ghost flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Stripe Dashboard
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`card-dark-wise relative overflow-hidden bg-gradient-to-br ${stat.gradient}`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </span>
              <div className={`p-2 rounded-xl bg-background/50 ${stat.iconColor}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["overview", "payments", "subscriptions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-accent text-accent-foreground"
                : "bg-muted/50 hover:bg-muted"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payments */}
          <div className="card-dark-wise">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-accent" />
              Recent Payments
            </h2>
            {summary?.recentPayments && summary.recentPayments.length > 0 ? (
              <div className="space-y-3">
                {summary.recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payment.created)} at {formatTime(payment.created)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-6">
                No recent payments
              </p>
            )}
          </div>

          {/* Subscription Overview */}
          <div className="card-dark-wise">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Subscription Status
            </h2>
            {subscriptions && subscriptions.total > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-green-500/10 rounded-xl">
                    <p className="text-2xl font-bold text-green-500">{subscriptions.active}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="text-center p-3 bg-blue-500/10 rounded-xl">
                    <p className="text-2xl font-bold text-blue-500">{subscriptions.trialing}</p>
                    <p className="text-xs text-muted-foreground">Trialing</p>
                  </div>
                  <div className="text-center p-3 bg-red-500/10 rounded-xl">
                    <p className="text-2xl font-bold text-red-500">{subscriptions.canceled}</p>
                    <p className="text-xs text-muted-foreground">Canceled</p>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="bg-green-500"
                    style={{ width: `${(subscriptions.active / subscriptions.total) * 100}%` }}
                  />
                  <div
                    className="bg-blue-500"
                    style={{ width: `${(subscriptions.trialing / subscriptions.total) * 100}%` }}
                  />
                  <div
                    className="bg-red-500"
                    style={{ width: `${(subscriptions.canceled / subscriptions.total) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-6">
                No subscriptions yet
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="card-dark-wise">
          <h2 className="text-lg font-bold mb-4">Payment History</h2>
          {payments?.charges && payments.charges.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase text-muted-foreground">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase text-muted-foreground">
                      Date
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-bold uppercase text-muted-foreground">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.charges.map((charge) => (
                    <tr key={charge.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(charge.status)}
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(charge.status)}`}>
                            {charge.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatCurrency(charge.amount, charge.currency)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {charge.description || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {formatDate(charge.created)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {charge.receipt_url && (
                          <a
                            href={charge.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline text-sm"
                          >
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">No payments found</p>
          )}
        </div>
      )}

      {activeTab === "subscriptions" && (
        <div className="card-dark-wise">
          <h2 className="text-lg font-bold mb-4">All Subscriptions</h2>
          {subscriptions?.subscriptions && subscriptions.subscriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase text-muted-foreground">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase text-muted-foreground">
                      Plan
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase text-muted-foreground">
                      Renews
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(sub.status)}
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(sub.status)}`}>
                            {sub.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{sub.customer}</td>
                      <td className="py-3 px-4 text-sm font-medium">{sub.plan || "N/A"}</td>
                      <td className="py-3 px-4 text-sm">
                        {sub.amount ? formatCurrency(sub.amount) : "N/A"}
                        {sub.interval && <span className="text-muted-foreground">/{sub.interval}</span>}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(sub.current_period_end)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">No subscriptions found</p>
          )}
        </div>
      )}
    </div>
  );
}
