import Link from "next/link";

import type { DashboardPageInfo } from "@/lib/dashboard/contracts";
import type { DashboardFilterQuery } from "@/lib/dashboard/query";
import { buildDashboardHref } from "@/lib/dashboard/query";

export function DashboardPagination({
  pageInfo,
  pathname,
  query,
}: {
  readonly pageInfo: DashboardPageInfo;
  readonly pathname: string;
  readonly query: DashboardFilterQuery;
}) {
  if (pageInfo.total === 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(pageInfo.total / pageInfo.pageSize));
  const previousPage = pageInfo.page > 1 ? pageInfo.page - 1 : undefined;
  const nextPage = pageInfo.hasMore && pageInfo.nextPage ? pageInfo.nextPage : undefined;

  return (
    <div className="nsos-pagination">
      <div className="nsos-pagination-copy">
        <span className="summary-name">
          Page {pageInfo.page} of {totalPages}
        </span>
        <span className="summary-detail">
          Showing {(pageInfo.page - 1) * pageInfo.pageSize + 1}-{Math.min(pageInfo.page * pageInfo.pageSize, pageInfo.total)} of {pageInfo.total}
        </span>
      </div>

      <div className="form-actions">
        {previousPage ? (
          <Link className="button button-secondary" href={buildDashboardHref(pathname, { ...query, page: previousPage })}>
            Previous
          </Link>
        ) : (
          <span className="button button-secondary" aria-disabled="true">
            Previous
          </span>
        )}
        {nextPage ? (
          <Link className="button button-secondary" href={buildDashboardHref(pathname, { ...query, page: nextPage })}>
            Next
          </Link>
        ) : (
          <span className="button button-secondary" aria-disabled="true">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
