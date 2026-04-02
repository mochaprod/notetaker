import Link from "next/link";

export function AuthNavbar() {
    return (
        <nav className="flex h-20 items-center px-8">
            <Link
                href="/"
                className="text-sm font-semibold text-foreground hover:text-foreground/80"
            >
                Drift
            </Link>
        </nav>
    );
}
