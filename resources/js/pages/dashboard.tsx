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

interface DashboardProps {
    stats: {
        total_clients: number;
        active_orders: number;
        in_production: number;
        low_stock_items: number;
        client_trend: number;
        order_trend: number;
    };
    recent_orders: Array<{
        id: number;
        reference: string;
        client_name: string;
        state: string;
        total_amount: number;
        created_at: string;
    }>;
    recent_production: Array<{
        id: number;
        reference: string;
        client_name: string;
        state: string;
        progress: number;
    }>;
    low_stock: Array<{
        id: number;
        name: string;
        sku: string;
        current_stock: number;
        reorder_point: number;
        unit: string;
    }>;
}

export default function Dashboard({ stats, recent_orders, recent_production, low_stock }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Stitchit ERP" />
            <div className="flex h-full flex-1 flex-col gap-8 bg-gradient-to-br from-[#F4F4F1] via-[#ECECE9] to-[#E8E8E5] p-8 lg:p-12">
                {/* Welcome Section - Soft Glassmorphic Card */}
                <div className="group relative overflow-hidden rounded-3xl border border-gray-200/60 bg-gradient-to-br from-[#2A2A2E] via-[#3A3A42] to-[#2A2A2E] p-10">
                    <div className="relative z-10">
                        <div className="mb-4 inline-flex items-center gap-2.5 rounded-full bg-white/15 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-[#F5C563]"></span>
                            Live Dashboard
                        </div>
                        <h1 className="text-4xl font-semibold tracking-[-0.02em] text-white">
                            Welcome back, Stitchit
                        </h1>
                        <p className="mt-3 text-base font-medium text-white/70">
                            Here's what's happening with your business today
                        </p>
                    </div>
                    {/* Soft Decorative Blobs */}
                    <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#F5C563]/20 blur-[100px] transition-all duration-700 group-hover:bg-[#F5C563]/30"></div>
                    <div className="absolute -bottom-12 right-24 h-56 w-56 rounded-full bg-[#7FBB92]/15 blur-[100px] transition-all duration-700 group-hover:bg-[#7FBB92]/25"></div>
                </div>

                {/* Stats Grid - Soft Metric Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Metric Card 1 - Total Clients */}
                    <div className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200/60 bg-white p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-gray-300/80">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                                <p className="text-sm font-medium text-[#6A6A72]">
                                    Total Clients
                                </p>
                                <p className="text-[2.75rem] font-bold leading-none tracking-[-0.02em] text-[#2A2A2E]">
                                    {stats.total_clients}
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                    {stats.client_trend !== 0 && (
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${
                                            stats.client_trend > 0 
                                                ? 'bg-[#F0F9F3] text-[#7FBB92]' 
                                                : 'bg-[#FEF4F4] text-[#E89B9B]'
                                        }`}>
                                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d={stats.client_trend > 0 ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"} clipRule="evenodd" />
                                            </svg>
                                            {stats.client_trend > 0 ? '+' : ''}{stats.client_trend}%
                                        </span>
                                    )}
                                    <span className="font-medium text-[#6A6A72]">vs last month</span>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-gradient-to-br from-[#8BB9D4]/20 to-[#8BB9D4]/10 p-3.5 transition-transform duration-300 group-hover:scale-110">
                                <svg className="h-7 w-7 text-[#8BB9D4]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Metric Card 2 - Active Orders */}
                    <div className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200/60 bg-white p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-gray-300/80">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                                <p className="text-sm font-medium text-[#6A6A72]">
                                    Active Orders
                                </p>
                                <p className="text-[2.75rem] font-bold leading-none tracking-[-0.02em] text-[#2A2A2E]">
                                    {stats.active_orders}
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                    {stats.order_trend !== 0 && (
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${
                                            stats.order_trend > 0 
                                                ? 'bg-[#F0F9F3] text-[#7FBB92]' 
                                                : 'bg-[#FEF4F4] text-[#E89B9B]'
                                        }`}>
                                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d={stats.order_trend > 0 ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"} clipRule="evenodd" />
                                            </svg>
                                            {stats.order_trend > 0 ? '+' : ''}{stats.order_trend}%
                                        </span>
                                    )}
                                    <span className="font-medium text-[#6A6A72]">from last month</span>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-gradient-to-br from-[#7FBB92]/20 to-[#7FBB92]/10 p-3.5 transition-transform duration-300 group-hover:scale-110">
                                <svg className="h-7 w-7 text-[#7FBB92]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Metric Card 3 - In Production */}
                    <div className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200/60 bg-white p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-gray-300/80">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                                <p className="text-sm font-medium text-[#6A6A72]">
                                    In Production
                                </p>
                                <p className="text-[2.75rem] font-bold leading-none tracking-[-0.02em] text-[#2A2A2E]">
                                    {stats.in_production}
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF9EC] px-2.5 py-1 font-semibold text-[#F5C563]">
                                        Active jobs
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-gradient-to-br from-[#F5C563]/20 to-[#F5C563]/10 p-3.5 transition-transform duration-300 group-hover:scale-110">
                                <svg className="h-7 w-7 text-[#F5C563]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Metric Card 4 - Low Stock Alert */}
                    <div className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200/60 bg-white p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-gray-300/80">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                                <p className="text-sm font-medium text-[#6A6A72]">
                                    Low Stock Alert
                                </p>
                                <p className="text-[2.75rem] font-bold leading-none tracking-[-0.02em] text-[#2A2A2E]">
                                    {stats.low_stock_items}
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${
                                        stats.low_stock_items > 0 
                                            ? 'bg-[#FEF4F4] text-[#E89B9B]' 
                                            : 'bg-[#F0F9F3] text-[#7FBB92]'
                                    }`}>
                                        {stats.low_stock_items > 0 ? 'Needs attention' : 'All good'}
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-gradient-to-br from-[#E89B9B]/20 to-[#E89B9B]/10 p-3.5 transition-transform duration-300 group-hover:scale-110">
                                <svg className="h-7 w-7 text-[#E89B9B]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid - Soft Cards */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column - 2/3 width */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Production Jobs - Soft Glassmorphic Card */}
                        <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white p-8">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold tracking-[-0.01em] text-[#2A2A2E]">Production Jobs</h2>
                                    <p className="mt-1 text-sm font-medium text-[#6A6A72]">{stats.in_production} rugs in production</p>
                                </div>
                                <Link href="/admin/production" className="group inline-flex items-center gap-2 rounded-full bg-[#F9F8F5] px-4 py-2 text-sm font-medium text-[#4A4A52] transition-all duration-300 hover:bg-[#F5C563]/20 hover:text-[#2A2A2E]">
                                    View all
                                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                            
                            {/* Production Jobs List */}
                            <div className="space-y-4">
                                {recent_production.length > 0 ? (
                                    recent_production.map((job) => (
                                        <Link
                                            key={job.id}
                                            href={`/admin/production/${job.id}`}
                                            className="group block overflow-hidden rounded-2xl border border-[#2A2A2E]/8 bg-gradient-to-br from-[#FDFDFC] to-[#F9F9F7] p-5 transition-all duration-300 hover:scale-[1.01] hover:border-[#F5C563]/40"
                                        >
                                            <div className="mb-4 flex items-start justify-between">
                                                <div>
                                                    <p className="font-semibold tracking-[-0.01em] text-[#2A2A2E]">{job.reference}</p>
                                                    <p className="mt-0.5 text-sm font-medium text-[#6A6A72]">{job.client_name}</p>
                                                </div>
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                    job.state === 'COMPLETED' ? 'bg-[#F0F9F3] text-[#7FBB92]' :
                                                    job.state === 'TUFTING' || job.state === 'FINISHING' ? 'bg-[#FFF9EC] text-[#F5C563]' :
                                                    'bg-[#F0F7FB] text-[#8BB9D4]'
                                                }`}>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                                                    {job.state.replace('_', ' ')}
                                                </span>
                                            </div>
                                            
                                            {/* Soft Progress Bar */}
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium text-[#6A6A72]">Progress</span>
                                                    <span className="font-bold text-[#2A2A2E]">{job.progress}%</span>
                                                </div>
                                                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#F4F4F1]">
                                                    <div 
                                                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#F5C563] to-[#F9E5B8] transition-all duration-500 ease-out"
                                                        style={{ width: `${job.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#F9F9F7] to-[#F4F4F1] p-12 text-center">
                                        <div className="mb-4 rounded-2xl bg-white/60 p-4">
                                            <svg className="h-14 w-14 text-[#6A6A72]/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                                            </svg>
                                        </div>
                                        <p className="mb-2 text-base font-semibold text-[#4A4A52]">No production jobs yet</p>
                                        <p className="mb-5 text-sm font-medium text-[#6A6A72]">Start creating rugs for your clients</p>
                                        <Link href="/admin/production/create" className="inline-flex items-center gap-2 rounded-full bg-[#2A2A2E] px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-[#3A3A42]">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Create first job
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Access - Soft Pills Navigation */}
                        <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white p-8">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold tracking-[-0.01em] text-[#2A2A2E]">Quick Access</h2>
                                    <p className="mt-1 text-sm font-medium text-[#6A6A72]">Navigate to key areas</p>
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Link href="/admin/clients" className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-[#8BB9D4]/20 bg-gradient-to-br from-[#F0F7FB] to-white p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[#8BB9D4]/40">
                                    <div className="rounded-xl bg-gradient-to-br from-[#8BB9D4]/30 to-[#8BB9D4]/20 p-3 transition-transform duration-300 group-hover:scale-110">
                                        <svg className="h-6 w-6 text-[#8BB9D4]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold tracking-[-0.01em] text-[#2A2A2E]">Clients</p>
                                        <p className="text-xs font-medium text-[#6A6A72]">Manage customers</p>
                                    </div>
                                    <svg className="h-4 w-4 text-[#6A6A72] transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>

                                <Link href="/admin/orders" className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-[#7FBB92]/20 bg-gradient-to-br from-[#F0F9F3] to-white p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[#7FBB92]/40">
                                    <div className="rounded-xl bg-gradient-to-br from-[#7FBB92]/30 to-[#7FBB92]/20 p-3 transition-transform duration-300 group-hover:scale-110">
                                        <svg className="h-6 w-6 text-[#7FBB92]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold tracking-[-0.01em] text-[#2A2A2E]">Orders</p>
                                        <p className="text-xs font-medium text-[#6A6A72]">Track orders</p>
                                    </div>
                                    <svg className="h-4 w-4 text-[#6A6A72] transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>

                                <Link href="/admin/production" className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-[#F5C563]/20 bg-gradient-to-br from-[#FFF9EC] to-white p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[#F5C563]/40">
                                    <div className="rounded-xl bg-gradient-to-br from-[#F5C563]/30 to-[#F5C563]/20 p-3 transition-transform duration-300 group-hover:scale-110">
                                        <svg className="h-6 w-6 text-[#F5C563]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold tracking-[-0.01em] text-[#2A2A2E]">Production</p>
                                        <p className="text-xs font-medium text-[#6A6A72]">Jobs & manufacturing</p>
                                    </div>
                                    <svg className="h-4 w-4 text-[#6A6A72] transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>

                                <Link href="/admin/inventory" className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-[#B8A8D4]/20 bg-gradient-to-br from-[#F5F3FA] to-white p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[#B8A8D4]/40">
                                    <div className="rounded-xl bg-gradient-to-br from-[#B8A8D4]/30 to-[#B8A8D4]/20 p-3 transition-transform duration-300 group-hover:scale-110">
                                        <svg className="h-6 w-6 text-[#B8A8D4]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold tracking-[-0.01em] text-[#2A2A2E]">Inventory</p>
                                        <p className="text-xs font-medium text-[#6A6A72]">Stock management</p>
                                    </div>
                                    <svg className="h-4 w-4 text-[#6A6A72] transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar Widgets */}
                    <div className="space-y-8">
                        {/* Recent Orders Widget */}
                        <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold tracking-[-0.01em] text-[#2A2A2E]">Recent Orders</h3>
                                    <p className="mt-0.5 text-xs font-medium text-[#6A6A72]">{recent_orders.length} new orders</p>
                                </div>
                                <Link href="/admin/orders" className="group inline-flex items-center gap-1.5 text-xs font-medium text-[#4A4A52] transition-all duration-300 hover:text-[#2A2A2E]">
                                    View all
                                    <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                            
                            <div className="space-y-3">
                                {recent_orders.length > 0 ? (
                                    recent_orders.map((order) => (
                                        <Link 
                                            key={order.id}
                                            href={`/admin/orders/${order.id}`}
                                            className="group flex items-center gap-3.5 overflow-hidden rounded-xl border border-[#2A2A2E]/8 bg-gradient-to-br from-[#FDFDFC] to-[#F9F9F7] p-3.5 transition-all duration-300 hover:scale-[1.01] hover:border-[#7FBB92]/30"
                                        >
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#7FBB92]/20 to-[#7FBB92]/10">
                                                <svg className="h-5 w-5 text-[#7FBB92]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold tracking-[-0.01em] text-[#2A2A2E] truncate">{order.reference}</p>
                                                <p className="text-xs font-medium text-[#6A6A72] truncate">{order.client_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-[#2A2A2E]">${order.total_amount}</p>
                                                <p className="text-xs font-medium text-[#6A6A72]">{order.created_at}</p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#F9F9F7] to-[#F4F4F1] p-8 text-center">
                                        <div className="mb-3 rounded-xl bg-white/60 p-3">
                                            <svg className="h-10 w-10 text-[#6A6A72]/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-medium text-[#6A6A72]">No recent orders</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Low Stock Items Widget */}
                        <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold tracking-[-0.01em] text-[#2A2A2E]">Low Stock Items</h3>
                                    <p className="mt-0.5 text-xs font-medium text-[#6A6A72]">{stats.low_stock_items} items need reordering</p>
                                </div>
                                <Link href="/admin/inventory/needs-reorder" className="group inline-flex items-center gap-1.5 text-xs font-medium text-[#4A4A52] transition-all duration-300 hover:text-[#2A2A2E]">
                                    View all
                                    <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Stock List */}
                            <div className="space-y-3">
                                {low_stock.length > 0 ? (
                                    low_stock.slice(0, 5).map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`/admin/inventory/${item.id}`}
                                            className="group flex items-center gap-3.5 overflow-hidden rounded-xl border border-[#2A2A2E]/8 bg-gradient-to-br from-[#FDFDFC] to-[#F9F9F7] p-3.5 transition-all duration-300 hover:scale-[1.01] hover:border-[#E89B9B]/30"
                                        >
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#E89B9B]/20 to-[#E89B9B]/10">
                                                <svg className="h-5 w-5 text-[#E89B9B]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold tracking-[-0.01em] text-[#2A2A2E] truncate">{item.name}</p>
                                                <p className="text-xs font-medium text-[#6A6A72]">{item.sku}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-[#E89B9B]">{item.current_stock} {item.unit}</p>
                                                <p className="text-xs font-medium text-[#6A6A72]">Min: {item.reorder_point}</p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#F0F9F3] to-[#E8F5EC] p-8 text-center">
                                        <div className="mb-3 rounded-xl bg-white/60 p-3">
                                            <svg className="h-10 w-10 text-[#7FBB92]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-semibold text-[#7FBB92]">All stock levels are healthy!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
