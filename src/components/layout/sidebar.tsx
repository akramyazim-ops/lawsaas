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
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const sections = [
    {
        title: "Practice",
        routes: [
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
        ]
    },
    {
        title: "Operations",
        routes: [
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
        ]
    },
    {
        title: "System",
        routes: [
            {
                label: "Settings",
                icon: Settings,
                href: "/dashboard/settings",
            },
        ]
    }
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
        <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border selection:bg-primary/30 relative">
            <div className="absolute inset-0 grain opacity-[0.03] pointer-events-none"></div>

            <div className="px-6 py-10 flex-1 relative z-10">
                <Link href="/dashboard" className="flex items-center mb-16 group">
                    <div className="h-10 w-10 bg-primary flex items-center justify-center transition-transform duration-500 group-hover:rotate-90">
                        <Shield className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="ml-4 flex flex-col">
                        <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">
                            LegalFlow
                        </h1>
                        <span className="text-[8px] font-black tracking-[0.4em] text-primary uppercase mt-1">
                            Pioneer Grade
                        </span>
                    </div>
                </Link>

                <div className="space-y-8">
                    {sections.map((section) => (
                        <div key={section.title} className="space-y-3">
                            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary opacity-60">
                                {section.title}
                            </h3>
                            <div className="space-y-1">
                                {section.routes.map((route) => {
                                    const isActive = pathname === route.href
                                    return (
                                        <Link
                                            key={route.href}
                                            href={route.href}
                                            className={cn(
                                                "text-[11px] group flex p-4 w-full justify-start font-black uppercase tracking-[0.15em] cursor-pointer transition-all duration-300 relative overflow-hidden",
                                                isActive
                                                    ? "text-primary border border-primary/20 bg-primary/5"
                                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="active-pill"
                                                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary gold-glow"
                                                />
                                            )}
                                            <div className="flex items-center flex-1">
                                                <route.icon className={cn(
                                                    "h-3.5 w-3.5 mr-4 transition-colors",
                                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
                                                )} />
                                                {route.label}
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {profile && (
                <div className="p-6 relative z-10">
                    <div className="architectural-border bg-card p-6 group cursor-default">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Zap className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary opacity-60">
                                System Status
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 mb-6">
                            <span className="text-sm font-black uppercase tracking-tighter text-white italic">
                                Plan: {profile.plan}
                            </span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">
                                {profile.subscription_status} access
                            </span>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="w-full text-[10px] font-black uppercase tracking-[0.2em] h-12 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all rounded-none"
                        >
                            <Link href="/pricing">
                                {profile.plan === 'pro_firm' ? 'Enterprise Dashboard' : 'Elevate Experience'}
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
