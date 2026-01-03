import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Sparkles, 
    ShoppingBag, 
    TrendingUp, 
    Package, 
    Users, 
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    const features = [
        {
            icon: ShoppingBag,
            title: 'Order Management',
            description: 'Track orders from creation to delivery with real-time updates'
        },
        {
            icon: Package,
            title: 'Production Tracking',
            description: 'Monitor rug production jobs, materials, and progress efficiently'
        },
        {
            icon: TrendingUp,
            title: 'Inventory Control',
            description: 'Manage stock levels, materials, and get low-stock alerts'
        },
        {
            icon: Users,
            title: 'Client Management',
            description: 'Maintain client relationships and order history in one place'
        }
    ];

    const benefits = [
        'Real-time production monitoring',
        'Automated inventory tracking',
        'Financial reporting & analytics',
        'Multi-user access control',
        'Cloud-based accessibility'
    ];

    return (
        <>
            <Head title="Stitchit ERP - Rug Business Management System" />
            
            {/* Modern Landing Page */}
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
                {/* Navigation */}
                <nav className="border-b border-white/10 bg-white/60 backdrop-blur-xl">
                    <div className="container mx-auto flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <img 
                                src="/STICHIT-01.png" 
                                alt="Stitchit" 
                                className="h-10 w-auto object-contain"
                            />
                            <span className="text-xl font-semibold text-foreground">
                                Stitchit ERP
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link href={dashboard()}>
                                    <Button size="lg" className="rounded-xl font-semibold">
                                        Go to Dashboard
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()}>
                                        <Button 
                                            variant="ghost" 
                                            size="lg"
                                            className="rounded-xl font-medium"
                                        >
                                            Log in
                                        </Button>
                                    </Link>
                                    {canRegister && (
                                        <Link href={register()}>
                                            <Button 
                                                size="lg"
                                                className="rounded-xl font-semibold"
                                            >
                                                Get Started
                                            </Button>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="container mx-auto px-6 py-20 lg:py-32">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        {/* Left Column - Content */}
                        <div className="flex flex-col justify-center space-y-8">
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/60 px-4 py-2 text-sm font-medium backdrop-blur-xl">
                                <Sparkles className="h-4 w-4 text-accent" />
                                Modern Business Management
                            </div>
                            
                            <div className="space-y-4">
                                <h1 className="text-5xl font-bold leading-tight tracking-tight text-foreground lg:text-6xl">
                                    Streamline Your
                                    <span className="mt-2 block bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent">
                                        Rug Business
                                    </span>
                                </h1>
                                <p className="text-lg text-muted-foreground lg:text-xl">
                                    Complete ERP solution for managing orders, production, inventory, 
                                    and finances in your rug manufacturing business.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                {!auth.user && (
                                    <>
                                        <Link href={login()}>
                                            <Button size="lg" className="w-full rounded-xl font-semibold sm:w-auto">
                                                Get Started
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </Link>
                                        <Button 
                                            variant="outline" 
                                            size="lg"
                                            className="w-full rounded-xl font-semibold sm:w-auto"
                                        >
                                            Watch Demo
                                        </Button>
                                    </>
                                )}
                                {auth.user && (
                                    <Link href={dashboard()}>
                                        <Button size="lg" className="rounded-xl font-semibold">
                                            Open Dashboard
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            {/* Benefits List */}
                            <div className="space-y-3 pt-4">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-accent" />
                                        <span className="text-sm font-medium text-foreground">
                                            {benefit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column - Dashboard Preview */}
                        <div className="relative">
                            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 blur-3xl"></div>
                            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-xl shadow-2xl">
                                <div className="space-y-4">
                                    {/* Mock Stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Active Orders', value: '56', trend: '+12%' },
                                            { label: 'In Production', value: '23', trend: '+8%' },
                                        ].map((stat, i) => (
                                            <div 
                                                key={i}
                                                className="rounded-2xl border border-white/30 bg-white/40 p-4 backdrop-blur-sm"
                                            >
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    {stat.label}
                                                </p>
                                                <div className="mt-2 flex items-end justify-between">
                                                    <p className="text-2xl font-bold text-foreground">
                                                        {stat.value}
                                                    </p>
                                                    <span className="text-xs font-semibold text-green-600">
                                                        {stat.trend}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mock Chart */}
                                    <div className="rounded-2xl border border-white/30 bg-white/40 p-4 backdrop-blur-sm">
                                        <p className="mb-3 text-xs font-medium text-muted-foreground">
                                            Production Overview
                                        </p>
                                        <div className="flex h-32 items-end justify-between gap-2">
                                            {[40, 65, 45, 80, 55, 70, 85].map((height, i) => (
                                                <div 
                                                    key={i}
                                                    className="w-full rounded-t-lg bg-gradient-to-t from-accent to-accent/50"
                                                    style={{ height: `${height}%` }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mock Activity */}
                                    <div className="space-y-2">
                                        {['New order received', 'Production completed', 'Stock replenished'].map((activity, i) => (
                                            <div 
                                                key={i}
                                                className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/30 p-3 backdrop-blur-sm"
                                            >
                                                <div className="h-2 w-2 rounded-full bg-accent"></div>
                                                <p className="text-xs font-medium text-foreground">
                                                    {activity}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="border-t border-white/10 bg-white/40 py-20 backdrop-blur-xl">
                    <div className="container mx-auto px-6">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
                                Everything You Need to Manage Your Rug Business
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Powerful features designed specifically for rug manufacturing
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div 
                                        key={index}
                                        className="group rounded-3xl border border-white/20 bg-white/60 p-6 backdrop-blur-xl transition-all hover:border-accent/40 hover:bg-white/80"
                                    >
                                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                                            <Icon className="h-6 w-6 text-accent" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-foreground">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                {!auth.user && (
                    <section className="py-20">
                        <div className="container mx-auto px-6">
                            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-foreground/95 via-foreground/90 to-foreground/85 p-12 text-white backdrop-blur-xl lg:p-16">
                                <div className="relative z-10 text-center">
                                    <h2 className="text-3xl font-bold lg:text-4xl">
                                        Ready to Transform Your Rug Business?
                                    </h2>
                                    <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
                                        Join businesses using Stitchit ERP to streamline operations 
                                        and boost productivity.
                                    </p>
                                    <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                                        <Link href={login()}>
                                            <Button 
                                                size="lg"
                                                variant="secondary"
                                                className="rounded-xl font-semibold"
                                            >
                                                Get Started Now
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/15 blur-3xl"></div>
                                <div className="absolute -bottom-8 right-20 h-40 w-40 rounded-full bg-white/5 blur-3xl"></div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="border-t border-white/10 bg-white/40 py-8 backdrop-blur-xl">
                    <div className="container mx-auto px-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} Stitchit ERP. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
