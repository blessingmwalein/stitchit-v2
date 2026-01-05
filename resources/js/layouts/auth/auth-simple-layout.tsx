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
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-6 md:p-10">
            {/* Soft Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FDFDFC] via-[#F9F8F5] to-[#F4F4F1]" />
            
            {/* Decorative Blobs - Soft, Subtle */}
            <div className="absolute top-0 right-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/4 rounded-full bg-gradient-to-br from-[#F5C563]/10 to-transparent blur-3xl" />
            <div className="absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/2 -translate-x-1/4 rounded-full bg-gradient-to-tr from-[#7FBB92]/10 to-transparent blur-3xl" />
            
            <div className="relative z-10 w-full max-w-md">
                {/* Glassmorphic Card Container */}
                <div className="rounded-3xl border border-white/30 bg-white/75 p-10 shadow-[0_20px_50px_rgba(42,42,46,0.08)] backdrop-blur-xl">
                    <div className="flex flex-col gap-10">
                        {/* Logo and Header */}
                        <div className="flex flex-col items-center gap-6">
                            <Link
                                href={home()}
                                className="group flex flex-col items-center gap-4 transition-transform duration-300 hover:scale-105"
                            >
                                <div className="rounded-2xl bg-gradient-to-br from-[#2A2A2E] to-[#4A4A52] p-4 shadow-lg transition-shadow duration-300 group-hover:shadow-xl">
                                    <img 
                                        src="/STICHIT-01.png" 
                                        alt="Stitchit Logo" 
                                        className="h-16 w-auto object-contain brightness-0 invert"
                                    />
                                </div>
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-3 text-center">
                                <h1 className="text-[1.875rem] font-semibold leading-tight tracking-[-0.01em] text-[#2A2A2E]">
                                    {title}
                                </h1>
                                <p className="text-sm font-medium text-[#6A6A72]">
                                    {description}
                                </p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs font-medium text-[#6A6A72]/80">
                    By continuing, you agree to our{' '}
                    <span className="text-[#4A4A52] underline decoration-[#F5C563]/50 underline-offset-2 transition-colors hover:text-[#2A2A2E]">
                        Terms of Service
                    </span>
                    {' '}and{' '}
                    <span className="text-[#4A4A52] underline decoration-[#F5C563]/50 underline-offset-2 transition-colors hover:text-[#2A2A2E]">
                        Privacy Policy
                    </span>
                </p>
            </div>
        </div>
    );
}
