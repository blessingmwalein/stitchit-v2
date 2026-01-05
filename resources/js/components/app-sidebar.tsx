import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { 
    LayoutGrid, 
    Users, 
    ShoppingCart, 
    Hammer, 
    Package, 
    ShoppingBag,
    Truck,
    FileText,
    Settings,
    Calculator,
    Receipt,
    BookOpen,
    BarChart3,
    DollarSign,
    PackageCheck
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Clients',
        href: '/admin/clients',
        icon: Users,
    },
    {
        title: 'Orders',
        href: '/admin/orders',
        icon: ShoppingCart,
    },
    {
        title: 'Production',
        href: '/admin/production',
        icon: Hammer,
    },
    {
        title: 'Finished Products',
        href: '/admin/finished-products',
        icon: PackageCheck,
    },
    {
        title: 'Inventory',
        href: '/admin/inventory',
        icon: Package,
    },
    {
        title: 'Purchases',
        href: '/admin/purchases',
        icon: ShoppingBag,
    },
    {
        title: 'Suppliers',
        href: '/admin/suppliers',
        icon: Truck,
    },
    {
        title: 'Rug Pricing',
        href: '/admin/rug-pricing',
        icon: DollarSign,
    },
    {
        title: 'Accounting',
        icon: Calculator,
        items: [
            {
                title: 'Expenses',
                href: '/admin/accounting/expenses',
                icon: Receipt,
            },
            {
                title: 'Journal Entries',
                href: '/admin/accounting/journal-entries',
                icon: BookOpen,
            },
            {
                title: 'Reports',
                href: '/admin/accounting/reports/income-statement',
                icon: BarChart3,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        href: '#',
        icon: FileText,
    },
    {
        title: 'Settings',
        href: '#',
        icon: Settings,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
