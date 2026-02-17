"use client"

import Link from "next/link"
import { Shield } from "lucide-react"

export function PublicHeader() {
    return (
        <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <Link className="flex items-center justify-center" href="/">
                <Shield className="h-6 w-6 text-primary mr-2" />
                <span className="font-bold text-xl">LegalFlow</span>
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6">
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="/#features">
                    Features
                </Link>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
                    Pricing
                </Link>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
                    Login
                </Link>
            </nav>
        </header>
    )
}
