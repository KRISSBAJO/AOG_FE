"use client";

import Link from "next/link";
import { Card, CardHeader, StatusBadge, ButtonLink } from "@/components/ui";
import { StatCard } from "@/components/dashboard/StatCard";
import { JobsChart } from "@/components/dashboard/JobsChart";
import { activity, recentJobs, stats } from "@/lib/dashboard-data";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Good morning, Jordan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening across your facilities today.
          </p>
        </div>
        <ButtonLink href="/dashboard" size="sm">
          + New job
        </ButtonLink>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      {/* Chart + activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Jobs completed this week"
            action={
              <span className="text-xs font-medium text-slate-400">
                Last 7 days
              </span>
            }
          />
          <JobsChart />
        </Card>

        <Card>
          <CardHeader title="Recent activity" />
          <ul className="divide-y divide-slate-100">
            {activity.map((item, i) => (
              <li key={i} className="flex gap-3 px-5 py-3.5">
                <span className="mt-1 h-2 w-2 flex-none rounded-full bg-amber-400" />
                <div className="text-sm">
                  <p className="text-slate-700">
                    <span className="font-semibold text-slate-900">
                      {item.who}
                    </span>{" "}
                    {item.action}{" "}
                    <span className="font-medium text-slate-900">
                      {item.target}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Jobs table */}
      <Card>
        <CardHeader
          title="Recent jobs"
          action={
            <Link
              href="/dashboard"
              className="text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              View all
            </Link>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Job</th>
                <th className="px-5 py-3 font-medium">Facility</th>
                <th className="px-5 py-3 font-medium">Team</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">{job.service}</p>
                    <p className="text-xs text-slate-400">{job.id}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{job.facility}</td>
                  <td className="px-5 py-3.5 text-slate-600">{job.team}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{job.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
