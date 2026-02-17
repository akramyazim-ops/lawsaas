"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export function Breadcrumb() {
    const pathname = usePathname()

    // Don't show breadcrumb on public pages
    if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname === "/" || pathname === "/pricing") {
        return null
    }

    const pathSegments = pathname.split("/").filter(Boolean)

    const breadcrumbItems = pathSegments.map((segment, index) => {
        const href = "/" + pathSegments.slice(0, index + 1).join("/")
        const isLast = index === pathSegments.length - 1

        // Format segment name
        let name = segment.charAt(0).toUpperCase() + segment.slice(1)

        // Handle specific routes
        if (segment === "dashboard") name = "Dashboard"
        if (segment === "cases") name = "Cases"
        if (segment === "clients") name = "Clients"
        if (segment === "documents") name = "Documents"
        if (segment === "billing") name = "Billing"

        // If it's a UUID (detail page), show "Details"
        if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            name = "Details"
        }

        return { name, href, isLast }
    })

    return (
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Link
                href="/dashboard"
                className="flex items-center hover:text-foreground transition-colors"
            >
                <Home className="h-4 w-4" />
            </Link>
            {breadcrumbItems.map((item, index) => (
                <div key={index} className="flex items-center">
                    <ChevronRight className="h-4 w-4 mx-1" />
                    {item.isLast ? (
                        <span className="font-medium text-foreground">{item.name}</span>
                    ) : (
                        <Link
                            href={item.href}
                            className="hover:text-foreground transition-colors"
                        >
                            {item.name}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    )
}
