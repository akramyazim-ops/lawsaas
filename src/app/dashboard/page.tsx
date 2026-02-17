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
    Calendar
} from "lucide-react"
import Link from "next/link"

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

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-muted-foreground">
                    Here's a snapshot of your firm's current status and upcoming tasks.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow cursor-default border-primary/10 bg-gradient-to-br from-white to-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Cases</CardTitle>
                        <Briefcase className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeCases}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Current matters in progress
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-default border-primary/10 bg-gradient-to-br from-white to-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalClients}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Managed relationships
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-default border-primary/10 bg-gradient-to-br from-white to-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Invoices</CardTitle>
                        <CreditCard className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Awaiting payment
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-default border-primary/10 bg-gradient-to-br from-white to-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.revenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            From paid invoices
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Upcoming Deadlines */}
                <Card className="shadow-sm border-primary/10">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Upcoming Deadlines</CardTitle>
                                <CardDescription>Key dates for cases and invoices.</CardDescription>
                            </div>
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {upcomingDeadlines.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                                No upcoming deadlines found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingDeadlines.map((deadline) => {
                                    const isOverdue = deadline.date < new Date() && (deadline.status !== 'paid' && deadline.status !== 'closed')
                                    return (
                                        <div key={`${deadline.type}-${deadline.id}`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-full",
                                                    deadline.type === 'case' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                                                )}>
                                                    {deadline.type === 'case' ? <Briefcase className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium leading-none">{deadline.title}</p>
                                                    <p className={cn("text-xs mt-1", isOverdue ? "text-destructive font-semibold" : "text-muted-foreground")}>
                                                        Due: {deadline.date.toLocaleDateString()} {isOverdue && "(Overdue)"}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={deadline.type === 'case' ? "outline" : "secondary"} className="capitalize">
                                                {deadline.type}
                                            </Badge>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="pt-4 border-t">
                        <Button variant="ghost" className="w-full text-sm text-primary hover:text-primary/80 group" asChild>
                            <Link href="/dashboard/cases">
                                View all matters <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                {/* Recent Cases */}
                <Card className="shadow-sm border-primary/10">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Matters</CardTitle>
                                <CardDescription>Latest cases added to the system.</CardDescription>
                            </div>
                            <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentCases.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                                No recent cases found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentCases.map((caseItem) => (
                                    <Link
                                        key={caseItem.id}
                                        href={`/dashboard/cases/${caseItem.id}`}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium group-hover:text-primary transition-colors">{caseItem.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Client: {caseItem.clients?.name || "N/A"}
                                            </p>
                                        </div>
                                        <Badge variant={caseItem.status === 'open' ? 'default' : 'secondary'} className="capitalize">
                                            {caseItem.status}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="pt-4 border-t">
                        <Button variant="ghost" className="w-full text-sm text-primary hover:text-primary/80 group" asChild>
                            <Link href="/dashboard/cases">
                                View all cases <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
