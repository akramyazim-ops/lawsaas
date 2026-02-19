"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
    Briefcase,
    Users,
    CreditCard,
    Clock,
    AlertCircle,
    Loader2,
    ArrowRight,
    CheckCircle2,
    Calendar,
    Trophy,
    TrendingUp
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CaseService } from "@/services/case-service"
import { ClientService } from "@/services/client-service"
import { InvoiceService } from "@/services/invoice-service"
import { CaseWithClient } from "@/types/case"
import { InvoiceWithDetails } from "@/types/invoice"
import { Client } from "@/types/client"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        activeCases: 0,
        totalClients: 0,
        pendingInvoices: 0,
        revenue: 0
    })
    const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([])
    const [recentCases, setRecentCases] = useState<CaseWithClient[]>([])

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true)
            try {
                const [casesRes, clientsRes, invoicesRes] = await Promise.all([
                    CaseService.getAll(),
                    ClientService.getAll(),
                    InvoiceService.getAll()
                ])

                const cases = casesRes.data || []
                const clients = clientsRes.data || []
                const invoices = invoicesRes.data || []

                // Calculate Stats
                const activeCases = cases.filter(c => c.status === 'open' || c.status === 'pending').length
                const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length
                const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + Number(inv.total), 0)

                setStats({
                    activeCases,
                    totalClients: clients.length,
                    pendingInvoices,
                    revenue: totalRevenue
                })

                // Recent cases
                setRecentCases(cases.slice(0, 5))

                // Combine Deadlines (Cases and Invoices)
                const now = new Date()
                const caseDeadlines = cases
                    .filter(c => c.due_date && c.status !== 'closed')
                    .map(c => ({
                        id: c.id,
                        type: 'case',
                        title: c.title,
                        date: new Date(c.due_date!),
                        status: c.status
                    }))

                const invoiceDeadlines = invoices
                    .filter(i => i.status === 'sent' || i.status === 'overdue')
                    .map(i => ({
                        id: i.id,
                        type: 'invoice',
                        title: `Invoice ${i.invoice_number}`,
                        date: new Date(i.due_date),
                        status: i.status
                    }))

                const allDeadlines = [...caseDeadlines, ...invoiceDeadlines]
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .slice(0, 5)

                setUpcomingDeadlines(allDeadlines)

            } catch (error: any) {
                console.error("Dashboard error:", error)
                toast.error("Failed to load dashboard metrics")
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR'
        }).format(amount)
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" as const }
        }
    }

    return (
        <div className="p-8 space-y-8 selection:bg-primary/30 min-h-screen max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-primary/10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-1"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-[9px] font-black tracking-[0.2em] border-primary/20 bg-primary/5 text-primary rounded-none px-2 py-0">COMMAND CENTER</Badge>
                        <span className="w-12 h-[1px] bg-primary/20"></span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic flex items-center gap-4">
                        <Trophy className="h-9 w-9 text-primary" /> Strategy Dashboard
                    </h2>
                    <p className="text-muted-foreground font-medium text-sm tracking-wide mt-1">
                        Operational intelligence for <span className="text-foreground font-bold italic underline decoration-primary/30">Pioneer Grade</span> law firms.
                    </p>
                </motion.div>

                {/* Quick Actions - Systematic like HubSpot */}
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="architectural-border bg-card border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all rounded-none h-11 px-6 text-[10px] font-black uppercase tracking-widest gap-2" asChild>
                        <Link href="/dashboard/cases">
                            <CheckCircle2 className="h-3 w-3" /> New Matter
                        </Link>
                    </Button>
                    <Button variant="outline" className="architectural-border bg-card border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all rounded-none h-11 px-6 text-[10px] font-black uppercase tracking-widest gap-2" asChild>
                        <Link href="/dashboard/clients">
                            <Users className="h-3 w-3" /> Add client
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Performance Matrix (Stats) */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
                {[
                    { title: "Open Matters", value: stats.activeCases, desc: "Operational volume", icon: Briefcase, color: "text-primary" },
                    { title: "Firm Clients", value: stats.totalClients, desc: "Managed base", icon: Users, color: "text-primary/70" },
                    { title: "Capital in Transit", value: stats.pendingInvoices, desc: "Revenue pending", icon: Clock, color: "text-primary/50" },
                    { title: "Realized Revenue", value: formatCurrency(stats.revenue), desc: "Total earnings", icon: TrendingUp, color: "text-primary" }
                ].map((stat, i) => (
                    <motion.div key={i} variants={itemVariants}>
                        <Card className="architectural-border overflow-hidden bg-card border-border hover:border-primary/40 transition-all duration-500 group cursor-default shadow-sm rounded-none p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{stat.title}</span>
                                <stat.icon className={cn("h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity duration-500", stat.color)} />
                            </div>
                            <div className="text-3xl font-black text-foreground tracking-widest leading-none mb-1">
                                {stat.value}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em]">{stat.desc}</span>
                                <div className="h-[1px] flex-1 bg-border"></div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Tactical Grid */}
            <div className="grid gap-6 md:grid-cols-12">
                {/* Precision Timeline (Left - 8 cols) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="md:col-span-8 flex flex-col gap-4"
                >
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-primary" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Tactical Timeline</h3>
                        </div>
                        <Link href="/dashboard/cases" className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary transition-colors italic">View Portfolio &rarr;</Link>
                    </div>

                    <Card className="architectural-border bg-card border-border shadow-sm rounded-none overflow-hidden">
                        <CardContent className="p-0">
                            {upcomingDeadlines.length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] italic">
                                    Strategic silence. No active deadlines.
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {upcomingDeadlines.map((deadline) => {
                                        const isOverdue = deadline.date < new Date() && (deadline.status !== 'paid' && deadline.status !== 'closed')
                                        return (
                                            <div key={`${deadline.type}-${deadline.id}`} className="flex items-center justify-between p-6 hover:bg-background/50 transition-colors group">
                                                <div className="flex items-center gap-5">
                                                    <div className={cn(
                                                        "p-3 architectural-border border-border group-hover:border-primary/40 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground",
                                                        deadline.type === 'case' ? "text-primary" : "text-muted-foreground"
                                                    )}>
                                                        {deadline.type === 'case' ? <Briefcase className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-base font-black text-foreground tracking-widest uppercase group-hover:text-primary transition-colors underline decoration-border group-hover:decoration-primary/20">{deadline.title}</p>
                                                        <div className="flex items-center gap-3">
                                                            <p className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5", isOverdue ? "text-red-600" : "text-muted-foreground")}>
                                                                <Clock className="h-3 w-3" />
                                                                {deadline.date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                                                            </p>
                                                            {isOverdue && <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[8px] h-4 rounded-none px-1 tracking-widest">CRITICAL</Badge>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">{deadline.type}</div>
                                                    <Badge variant="outline" className="border-border text-[8px] py-0 px-1 font-bold rounded-none uppercase">Detail &rarr;</Badge>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Registry Entries (Right - 4 cols) - Systematic & Clean */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="md:col-span-4 flex flex-col gap-4"
                >
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-4 w-4 text-primary" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Registry Entry</h3>
                        </div>
                    </div>

                    <Card className="architectural-border bg-card border-border shadow-sm rounded-none overflow-hidden">
                        <CardContent className="p-0">
                            {recentCases.length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] italic px-8">
                                    Registry clear. No high-priority additions.
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {recentCases.map((caseItem) => (
                                        <Link
                                            key={caseItem.id}
                                            href={`/dashboard/cases/${caseItem.id}`}
                                            className="flex items-center gap-4 p-5 hover:bg-background/50 transition-all group"
                                        >
                                            <div className="w-1 h-8 bg-primary/40 group-hover:bg-primary transition-colors"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-foreground tracking-widest uppercase truncate group-hover:text-primary transition-colors">{caseItem.title}</p>
                                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.1em] truncate italic mt-0.5">
                                                    Ref: {caseItem.clients?.name || "Anonymous Client"}
                                                </p>
                                            </div>
                                            <Badge
                                                className={cn(
                                                    "text-[8px] font-black px-1.5 py-0 rounded-none border-none tracking-widest h-5",
                                                    caseItem.status === 'open' ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground"
                                                )}
                                            >
                                                {caseItem.status}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        {recentCases.length > 0 && (
                            <CardFooter className="p-0 border-t border-border">
                                <Button variant="ghost" className="w-full h-12 text-[9px] font-black uppercase tracking-[0.3em] text-primary hover:text-primary-foreground hover:bg-primary transition-all rounded-none group" asChild>
                                    <Link href="/dashboard/cases">
                                        Open Registry <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        )}
                    </Card>

                    {/* Integrated Insight Box - Hubspot Style */}
                    <div className="mt-2 p-6 architectural-border bg-primary/5 border-primary/20 border-dashed group hover:bg-primary/10 transition-all cursor-default shadow-sm text-card-foreground">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Insight Engine</span>
                            <TrendingUp className="h-4 w-4 text-primary opacity-60 animate-pulse" />
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground leading-relaxed italic pr-4">
                            &quot;System detected {stats.activeCases} active matters with high tactical momentum. Ensure all client registries are synchronized for the upcoming review.&quot;
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
