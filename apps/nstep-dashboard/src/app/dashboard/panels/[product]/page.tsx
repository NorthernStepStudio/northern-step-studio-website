import { notFound } from "next/navigation";

import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { DashboardMetricStrip } from "@/components/dashboard/metric-strip";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardProductPanel } from "@/components/dashboard/product-panel";
import { DashboardStatusPill } from "@/components/dashboard/status-pill";
import { DashboardApiError, getDashboardProductPanel } from "@/lib/dashboard/api";
import { formatDateTime, productTitle } from "@/lib/dashboard/format";
import { getProductMeta, isProductKey } from "@/lib/dashboard/nav";
import { parseDashboardQuery, type DashboardSearchParamsInput } from "@/lib/dashboard/query";

export const dynamic = "force-dynamic";

export default async function ProductPanelPage({
  params,
  searchParams,
}: {
  readonly params: { readonly product: string };
  readonly searchParams?: DashboardSearchParamsInput;
}) {
  const { product } = params;
  assertDashboardAccess(await readDashboardSessionFromCookies(), `/dashboard/panels/${product}`);
  const query = await parseDashboardQuery(searchParams);

  if (!isProductKey(product)) {
    notFound();
  }

  let panel;
  try {
    panel = await getDashboardProductPanel(product, query);
  } catch (error) {
    if (error instanceof DashboardApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <>
      <DashboardPageHeader
        eyebrow={`${productTitle(panel.product)} panel`}
        title={panel.title}
        subtitle={getProductMeta(panel.product).description}
        actions={<DashboardStatusPill value={panel.product} />}
        meta={<DashboardStatusPill value="live" label={`Updated ${formatDateTime(panel.generatedAt)}`} />}
      />

      <DashboardMetricStrip
        metrics={[
          panel.summary.primaryMetric,
          ...panel.summary.secondaryMetrics.slice(0, 3),
        ]}
      />

      <DashboardProductPanel panel={panel} query={query} />
    </>
  );
}
