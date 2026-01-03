import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Stitchit ERP" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 lg:p-8">
                {/* Welcome Section with modern gradient */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/90 p-8 text-white shadow-sm">
                    <div className="relative z-10">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></span>
                            Live Dashboard
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Welcome back, Stitchit
                        </h1>
                        <p className="mt-2.5 text-base text-white/80">
                            Here's what's happening with your business today
                        </p>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/20 blur-3xl"></div>
                    <div className="absolute -bottom-8 right-20 h-40 w-40 rounded-full bg-accent/10 blur-3xl"></div>
                </div>

                {/* Stats Grid - Modern card design */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Stat Card 1 - Employee */}
                    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Employees
                                </p>
                                <p className="text-4xl font-bold tracking-tight text-foreground">
                                    78
                                </p>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <span className="rounded-md bg-green-50 px-2 py-0.5 font-semibold text-green-700">
                                        +12%
                                    </span>
                                    <span className="text-muted-foreground">vs last month</span>
                                </div>
                            </div>
                            <div className="rounded-xl bg-blue-50 p-3">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Stat Card 2 - Hirings */}
                    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Active Orders
                                </p>
                                <p className="text-4xl font-bold tracking-tight text-foreground">
                                    56
                                </p>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <span className="rounded-md bg-green-50 px-2 py-0.5 font-semibold text-green-700">
                                        +8%
                                    </span>
                                    <span className="text-muted-foreground">from last week</span>
                                </div>
                            </div>
                            <div className="rounded-xl bg-green-50 p-3">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Stat Card 3 - Projects */}
                    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    In Production
                                </p>
                                <p className="text-4xl font-bold tracking-tight text-foreground">
                                    203
                                </p>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <span className="rounded-md bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
                                        +5 new
                                    </span>
                                    <span className="text-muted-foreground">this week</span>
                                </div>
                            </div>
                            <div className="rounded-xl bg-accent/10 p-3">
                                <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Stat Card 4 - Revenue */}
                    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Low Stock Alert
                                </p>
                                <p className="text-4xl font-bold tracking-tight text-foreground">
                                    12
                                </p>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <span className="rounded-md bg-red-50 px-2 py-0.5 font-semibold text-red-700">
                                        Needs attention
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-xl bg-red-50 p-3">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - 2/3 width */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Progress Widget */}
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">Production Progress</h2>
                                    <p className="text-sm text-muted-foreground">Weekly work time overview</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-foreground">6.1h</p>
                                    <p className="text-xs text-muted-foreground">Work Time this week</p>
                                </div>
                            </div>
                            
                            {/* Bar Chart Placeholder */}
                            <div className="flex h-48 items-end justify-between gap-3">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
                                    const heights = [40, 60, 50, 70, 85, 45, 30];
                                    const isToday = idx === 4;
                                    return (
                                        <div key={day} className="flex flex-1 flex-col items-center gap-2">
                                            <div className="relative w-full">
                                                {isToday && (
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-accent px-2 py-1 text-xs font-semibold text-foreground">
                                                        5h 24m
                                                    </div>
                                                )}
                                                <div
                                                    className={`w-full rounded-lg transition-all ${
                                                        isToday ? 'bg-accent' : 'bg-muted'
                                                    }`}
                                                    style={{ height: `${heights[idx]}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium text-muted-foreground">{day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Access */}
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">Quick Access</h2>
                                    <p className="text-sm text-muted-foreground">Navigate to key areas</p>
                                </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Link href="/admin/clients" className="group flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-accent hover:bg-accent/5">
                                    <div className="rounded-lg bg-blue-50 p-2.5 transition-colors group-hover:bg-blue-100">
                                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">Clients</p>
                                        <p className="text-xs text-muted-foreground">Manage customers</p>
                                    </div>
                                    <svg className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>

                                <Link href="/admin/orders" className="group flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-accent hover:bg-accent/5">
                                    <div className="rounded-lg bg-green-50 p-2.5 transition-colors group-hover:bg-green-100">
                                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">Orders</p>
                                        <p className="text-xs text-muted-foreground">Track orders</p>
                                    </div>
                                    <svg className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>

                                <Link href="/admin/production" className="group flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-accent hover:bg-accent/5">
                                    <div className="rounded-lg bg-accent/10 p-2.5 transition-colors group-hover:bg-accent/20">
                                        <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">Production</p>
                                        <p className="text-xs text-muted-foreground">Jobs & manufacturing</p>
                                    </div>
                                    <svg className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>

                                <Link href="/admin/inventory" className="group flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-accent hover:bg-accent/5">
                                    <div className="rounded-lg bg-purple-50 p-2.5 transition-colors group-hover:bg-purple-100">
                                        <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">Inventory</p>
                                        <p className="text-xs text-muted-foreground">Stock management</p>
                                    </div>
                                    <svg className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - 1/3 width */}
                    <div className="space-y-6">
                        {/* Time Tracker Widget */}
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-base font-semibold text-foreground">Time Tracker</h3>
                                <button className="rounded-lg p-1.5 hover:bg-muted">
                                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Circular Progress */}
                            <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
                                <svg className="h-full w-full -rotate-90 transform">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="none"
                                        className="text-muted"
                                    />
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeDasharray={2 * Math.PI * 88}
                                        strokeDashoffset={2 * Math.PI * 88 * (1 - 0.65)}
                                        className="text-accent transition-all"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <p className="text-3xl font-bold text-foreground">02:35</p>
                                    <p className="text-xs text-muted-foreground">Work Time</p>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-foreground/90">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    Start
                                </button>
                                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                    </svg>
                                    Pause
                                </button>
                            </div>
                        </div>

                        {/* Onboarding Tasks */}
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">Onboarding</h3>
                                    <p className="text-xs text-muted-foreground">18% Complete</p>
                                </div>
                                <span className="text-sm font-bold text-foreground">2/8</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div className="h-full w-[18%] rounded-full bg-accent transition-all"></div>
                            </div>

                            {/* Task List */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 rounded-lg bg-background p-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                                        <svg className="h-4 w-4 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">Interview</p>
                                        <p className="text-xs text-muted-foreground">Sep 13, 10:30</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-lg bg-background p-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                                        <svg className="h-4 w-4 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">Teams Meeting</p>
                                        <p className="text-xs text-muted-foreground">Sep 13, 10:15</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-lg bg-background p-3 opacity-50">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-muted">
                                        <span className="text-xs font-bold text-muted-foreground">3</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">Project Update</p>
                                        <p className="text-xs text-muted-foreground">Sep 13, 15:00</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-lg bg-background p-3 opacity-50">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-muted">
                                        <span className="text-xs font-bold text-muted-foreground">4</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">HR Policy Review</p>
                                        <p className="text-xs text-muted-foreground">Sep 13, 16:30</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
