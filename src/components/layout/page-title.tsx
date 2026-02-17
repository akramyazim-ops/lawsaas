"use client"

import { usePathname } from "next/navigation"

const routeNames: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/cases": "Cases",
    "/dashboard/clients": "Clients",
    "/dashboard/documents": "Documents",
    "/dashboard/billing": "Billing",
    "/dashboard/settings": "Settings",
}

// Handle dynamic routes
function getPageTitle(pathname: string): string {
    // Check exact match first
    if (routeNames[pathname]) {
        return routeNames[pathname]
    }

    // Handle dynamic routes
    if (pathname.startsWith("/dashboard/cases/")) {
        return "Case Details"
    }
    if (pathname.startsWith("/dashboard/clients/")) {
        return "Client Details"
    }

    return "Dashboard"
}

export function PageTitle() {
    const pathname = usePathname()
    const title = getPageTitle(pathname)

    return (
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
    )
}
