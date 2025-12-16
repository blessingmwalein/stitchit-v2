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
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Welcome Section */}
                <div className="rounded-lg bg-gradient-to-r from-[#FF8A50] to-[#FF9B71] p-6 text-white shadow-lg">
                    <h1 className="text-3xl font-bold">Welcome to Stitchit ERP</h1>
                    <p className="mt-2 text-lg opacity-90">Manage your tufting rug business efficiently</p>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">In Production</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
                            </div>
                            <div className="rounded-full bg-[#FF8A50] bg-opacity-20 p-3">
                                <svg className="h-6 w-6 text-[#FF8A50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
                            </div>
                            <div className="rounded-full bg-red-100 p-3">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Access Modules */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">Quick Access</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Link href="/admin/clients" className="group flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-[#FF8A50] hover:bg-orange-50">
                            <div className="rounded-lg bg-blue-100 p-3 group-hover:bg-blue-200">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Clients</p>
                                <p className="text-sm text-gray-600">Manage customers</p>
                            </div>
                        </Link>

                        <Link href="/admin/orders" className="group flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-[#FF8A50] hover:bg-orange-50">
                            <div className="rounded-lg bg-green-100 p-3 group-hover:bg-green-200">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Orders</p>
                                <p className="text-sm text-gray-600">Track customer orders</p>
                            </div>
                        </Link>

                        <Link href="/admin/production" className="group flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-[#FF8A50] hover:bg-orange-50">
                            <div className="rounded-lg bg-[#FF8A50] bg-opacity-20 p-3 group-hover:bg-opacity-30">
                                <svg className="h-6 w-6 text-[#FF8A50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Production</p>
                                <p className="text-sm text-gray-600">Manufacturing jobs</p>
                            </div>
                        </Link>

                        <Link href="/admin/inventory" className="group flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-[#FF8A50] hover:bg-orange-50">
                            <div className="rounded-lg bg-purple-100 p-3 group-hover:bg-purple-200">
                                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Inventory</p>
                                <p className="text-sm text-gray-600">Stock management</p>
                            </div>
                        </Link>

                        <Link href="/admin/purchases" className="group flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-[#FF8A50] hover:bg-orange-50">
                            <div className="rounded-lg bg-yellow-100 p-3 group-hover:bg-yellow-200">
                                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Purchases</p>
                                <p className="text-sm text-gray-600">Purchase orders</p>
                            </div>
                        </Link>

                        <div className="group flex items-center gap-4 rounded-lg border border-dashed border-gray-300 p-4 opacity-50">
                            <div className="rounded-lg bg-gray-100 p-3">
                                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Accounting</p>
                                <p className="text-sm text-gray-600">Coming soon</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
