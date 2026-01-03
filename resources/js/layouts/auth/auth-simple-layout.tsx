import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
            <div className="w-full max-w-md">
                {/* Modern Card Container */}
                <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                    <div className="flex flex-col gap-8">
                        {/* Logo and Header */}
                        <div className="flex flex-col items-center gap-5">
                            <Link
                                href={home()}
                                className="flex flex-col items-center gap-3"
                            >
                                <img 
                                    src="/STICHIT-01.png" 
                                    alt="Stitchit Logo" 
                                    className="h-20 w-auto object-contain"
                                />
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-2.5 text-center">
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                    {title}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-muted-foreground">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}
