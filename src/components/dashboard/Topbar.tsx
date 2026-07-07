"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  ChevronDown,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import {
  type AuthUser,
  clearAuthSession,
  getMe,
  logout,
} from "@/lib/auth";
import {
  communicationsApi,
  type Notification as AppNotification,
} from "@/lib/api/communications";
import { operationsApi } from "@/lib/api/operations";
import { workforceApi } from "@/lib/api/workforce";
import { formatDateTime, formatEnum } from "@/lib/formatters";
import { phase3Api } from "@/lib/phase3-api";

type SearchResult = {
  id: string;
  label: string;
  detail: string;
  group: string;
  href: string;
};

const searchableModules = [
  { label: "Customers", href: "/dashboard/customers" },
  { label: "Facilities", href: "/dashboard/facilities" },
  { label: "Services", href: "/dashboard/services" },
  { label: "Contracts", href: "/dashboard/contracts" },
  { label: "Service Requests", href: "/dashboard/service-requests" },
  { label: "Work Orders", href: "/dashboard/work-orders" },
  { label: "Workforce", href: "/dashboard/workforce" },
  { label: "Billing", href: "/dashboard/billing" },
  { label: "Reports", href: "/dashboard/reports" },
];

function detailHref(path: string, id: string) {
  return `${path}/detail?id=${encodeURIComponent(id)}`;
}

function notificationHref(notification: AppNotification) {
  const entityType = notification.entityType?.toUpperCase();
  const entityId = notification.entityId;

  if (!entityId) return "/dashboard/messages";

  if (entityType === "CUSTOMER") return detailHref("/dashboard/customers", entityId);
  if (entityType === "FACILITY") return detailHref("/dashboard/facilities", entityId);
  if (entityType === "SERVICE_REQUEST") return detailHref("/dashboard/service-requests", entityId);
  if (entityType === "CONTRACT") return detailHref("/dashboard/contracts", entityId);
  if (entityType === "WORK_ORDER") return detailHref("/dashboard/work-orders", entityId);
  if (entityType === "INSPECTION") return detailHref("/dashboard/qa", entityId);
  if (entityType === "COMPLAINT") return detailHref("/dashboard/issues", entityId);
  if (entityType === "INCIDENT") return `/dashboard/issues/incident-detail?id=${encodeURIComponent(entityId)}`;
  if (entityType === "INVOICE" || entityType === "PAYMENT") return "/dashboard/billing";
  if (entityType === "EMPLOYEE") return "/dashboard/workforce";
  if (entityType === "MESSAGE") return "/dashboard/messages";

  return "/dashboard/messages";
}

function resultMatchesModule(query: string): SearchResult[] {
  const normalized = query.toLowerCase();
  return searchableModules
    .filter((item) => item.label.toLowerCase().includes(normalized))
    .map((item) => ({
      id: item.href,
      label: item.label,
      detail: "Open dashboard module",
      group: "Module",
      href: item.href,
    }));
}

async function searchWorkspace(query: string): Promise<SearchResult[]> {
  const take = 4;
  const [
    customerResponse,
    facilityResponse,
    serviceResponse,
    contractResponse,
    requestResponse,
    workOrderResponse,
    employeeResponse,
  ] = await Promise.allSettled([
    phase3Api.listCustomers({ search: query, take }),
    phase3Api.listFacilities({ search: query, take }),
    phase3Api.listServices({ search: query, take }),
    phase3Api.listContracts({ search: query, take }),
    operationsApi.listServiceRequests({ search: query, take }),
    operationsApi.listWorkOrders({ search: query, take }),
    workforceApi.listEmployees({ search: query, take }),
  ]);

  const fromSettled = <T,>(response: PromiseSettledResult<{ data: T[] }>) =>
    response.status === "fulfilled" ? response.value.data : [];

  const results: SearchResult[] = [
    ...resultMatchesModule(query),
    ...fromSettled(customerResponse).map((customer) => ({
      id: customer.id,
      label: customer.name,
      detail: customer.billingEmail || customer.phone || "Customer account",
      group: "Customer",
      href: detailHref("/dashboard/customers", customer.id),
    })),
    ...fromSettled(facilityResponse).map((facility) => ({
      id: facility.id,
      label: facility.name,
      detail: facility.customer?.name || [facility.city, facility.state].filter(Boolean).join(", ") || "Facility",
      group: "Facility",
      href: detailHref("/dashboard/facilities", facility.id),
    })),
    ...fromSettled(serviceResponse).map((service) => ({
      id: service.id,
      label: service.name,
      detail: `${formatEnum(service.serviceLine)} service`,
      group: "Service",
      href: detailHref("/dashboard/services", service.id),
    })),
    ...fromSettled(contractResponse).map((contract) => ({
      id: contract.id,
      label: contract.title,
      detail: `${contract.contractNumber} · ${contract.customer?.name || "Contract"}`,
      group: "Contract",
      href: detailHref("/dashboard/contracts", contract.id),
    })),
    ...fromSettled(requestResponse).map((request) => ({
      id: request.id,
      label: request.title,
      detail: `${request.requestNumber} · ${formatEnum(request.status)}`,
      group: "Request",
      href: detailHref("/dashboard/service-requests", request.id),
    })),
    ...fromSettled(workOrderResponse).map((workOrder) => ({
      id: workOrder.id,
      label: workOrder.title,
      detail: `${workOrder.workOrderNumber} · ${formatEnum(workOrder.status)}`,
      group: "Work order",
      href: detailHref("/dashboard/work-orders", workOrder.id),
    })),
    ...fromSettled(employeeResponse).map((employee) => ({
      id: employee.id,
      label: `${employee.firstName} ${employee.lastName}`,
      detail: employee.email || employee.employeeNumber,
      group: "Staff",
      href: "/dashboard/workforce",
    })),
  ];

  return results.slice(0, 12);
}

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    getMe()
      .then((profile) => {
        if (active) setUser(profile);
      })
      .catch(() => {
        clearAuthSession();
        if (active) setUser(null);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    void loadNotifications();
    const timer = window.setInterval(() => void loadNotifications(), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchWorkspace(trimmed);
        if (active) {
          setSearchResults(results);
          setSearchOpen(true);
        }
      } catch {
        if (active) setSearchResults([]);
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const initials = useMemo(() => {
    const source = user?.displayName || user?.email || "AOG";
    return source
      .split(/\s|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user]);

  async function handleSignOut() {
    setMenuOpen(false);
    setUser(null);
    await logout();
    router.replace("/sign-in");
  }

  async function loadNotifications() {
    setNotificationsLoading(true);
    try {
      const response = await communicationsApi.listNotifications({ take: 10 });
      setNotifications(response.data);
      setUnreadCount(
        response.meta.unread ??
          response.data.filter((notification) => notification.status === "UNREAD").length,
      );
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  }

  function goTo(href: string) {
    setSearchOpen(false);
    setNotificationOpen(false);
    setMenuOpen(false);
    setQuery("");
    router.push(href);
  }

  async function openNotification(notification: AppNotification) {
    if (notification.status === "UNREAD") {
      try {
        await communicationsApi.readNotification(notification.id);
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, status: "READ" } : item,
          ),
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch {
        // Keep navigation responsive even if the read update fails.
      }
    }

    goTo(notificationHref(notification));
  }

  async function readAllNotifications() {
    try {
      await communicationsApi.readAllNotifications();
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, status: "READ" })),
      );
      setUnreadCount(0);
    } catch {
      await loadNotifications();
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 shadow-sm shadow-slate-200/40 backdrop-blur-xl lg:px-8">
      <button
        onClick={onOpenMenu}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 xl:flex">
        <LayoutDashboard className="h-4 w-4 text-amber-500" />
        AOG Command Center
      </div>

      <div className="relative hidden max-w-xl flex-1 sm:block">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (searchResults[0]) goTo(searchResults[0].href);
          }}
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search contracts, facilities, staff..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-11 text-sm text-slate-700 placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30"
          />
          {searchLoading && (
            <Loader2 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
          )}
        </form>

        {searchOpen && query.trim().length >= 2 && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setSearchOpen(false)} />
            <div className="absolute left-0 right-0 z-30 mt-2 max-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Global search
                </p>
              </div>
              <div className="max-h-[450px] overflow-y-auto p-2">
                {searchResults.map((result) => (
                  <button
                    key={`${result.group}-${result.id}`}
                    type="button"
                    onClick={() => goTo(result.href)}
                    className="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left hover:bg-slate-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">
                        {result.label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {result.detail}
                      </span>
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      {result.group}
                    </span>
                  </button>
                ))}
                {!searchLoading && searchResults.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <Search className="mx-auto h-5 w-5 text-slate-300" />
                    <p className="mt-2 text-sm font-medium text-slate-600">
                      No matching records found.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationOpen((value) => !value);
              setMenuOpen(false);
              setSearchOpen(false);
              void loadNotifications();
            }}
            className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-900"
            aria-label="Notifications"
            aria-expanded={notificationOpen}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-black text-slate-950 ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setNotificationOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-3 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-950">Notifications</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {unreadCount} unread alert{unreadCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void readAllNotifications()}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-950"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Read all
                  </button>
                </div>
                <div className="max-h-[420px] overflow-y-auto p-2">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => void openNotification(notification)}
                      className="flex w-full gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-50"
                    >
                      <span
                        className={`mt-1 h-2.5 w-2.5 flex-none rounded-full ${
                          notification.status === "UNREAD" ? "bg-amber-400" : "bg-slate-200"
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                          {notification.title}
                        </span>
                        {notification.body && (
                          <span className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {notification.body}
                          </span>
                        )}
                        <span className="mt-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          {formatEnum(notification.type)} · {formatDateTime(notification.createdAt)}
                        </span>
                      </span>
                    </button>
                  ))}
                  {!notificationsLoading && notifications.length === 0 && (
                    <div className="px-4 py-8 text-center">
                      <Inbox className="mx-auto h-5 w-5 text-slate-300" />
                      <p className="mt-2 text-sm font-medium text-slate-600">
                        No notifications yet.
                      </p>
                    </div>
                  )}
                  {notificationsLoading && notifications.length === 0 && (
                    <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading notifications
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition hover:bg-slate-50"
            aria-expanded={menuOpen}
            aria-label="Open account menu"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1120] text-sm font-black text-amber-300">
              {initials || <UserRound className="h-4 w-4" />}
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block max-w-44 truncate text-sm font-semibold text-slate-900">
                {user?.displayName || "AOG user"}
              </span>
              <span className="block max-w-44 truncate text-xs text-slate-500">
                {user?.email || "Authenticated workspace"}
              </span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                <div className="bg-slate-50 px-4 py-4">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {user?.displayName || "AOG user"}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {user?.email || "Signed in"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/dashboard");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <LayoutDashboard className="h-4 w-4 text-amber-500" />
                  Dashboard overview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/dashboard/settings");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4 text-slate-500" />
                  Workspace settings
                </button>
                <hr className="border-slate-100" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
