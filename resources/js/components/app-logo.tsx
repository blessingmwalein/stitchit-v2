export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-xl overflow-hidden bg-white">
                <img 
                    src="/STICHIT-01.png" 
                    alt="Stichit Logo" 
                    className="h-full w-full object-contain"
                />
            </div>
            <div className="ml-2.5 grid flex-1 text-left">
                <span className="truncate text-base font-bold leading-tight tracking-tight">
                    Stichit
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    ERP System
                </span>
            </div>
        </>
    );
}
