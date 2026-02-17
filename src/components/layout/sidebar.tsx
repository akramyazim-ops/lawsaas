"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Briefcase,
    FileText,
    CreditCard,
    Settings,
    Shield,
    Zap
} from "lucide-react"
import { SubscriptionService } from "@/services/subscription-service"
import { Profile } from "@/types/profile"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    {
        label: "Cases",
        icon: Briefcase,
        href: "/dashboard/cases",
    },
    {
        label: "Clients",
        icon: Users,
        href: "/dashboard/clients",
    },
    {
        label: "Documents",
        icon: FileText,
        href: "/dashboard/documents",
    },
    {
        label: "Billing",
        icon: CreditCard,
        href: "/dashboard/billing",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const [profile, setProfile] = useState<Profile | null>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            const { data } = await SubscriptionService.getCurrentProfile()
            if (data) setProfile(data)
        }
        fetchProfile()
    }, [])

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-sm">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-10">
                    <Shield className="h-8 w-8 text-primary mr-2" />
                    <h1 className="text-2xl font-bold text-primary">
                        LegalFlow
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200",
                                pathname === route.href
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3 transition-colors", pathname === route.href ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {profile && (
                <div className="mx-4 mb-4">
                    <div className="bg-sidebar-accent/50 rounded-xl p-4 border border-sidebar-border/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-primary fill-primary/20" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Current Plan
                            </span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold capitalize">{profile.plan}</span>
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-primary/20 bg-primary/5 text-primary">
                                {profile.subscription_status}
                            </Badge>
                        </div>
                        <Link
                            href="/pricing"
                            className="block w-full text-center text-xs font-medium py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            {profile.plan === 'enterprise' ? 'Manage' : 'Upgrade Plan'}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
