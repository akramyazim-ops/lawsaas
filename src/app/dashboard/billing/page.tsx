"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { InvoiceWithDetails } from "@/types/invoice"
import { InvoiceService } from "@/services/invoice-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, Loader2, Calendar as CalendarIcon, FilterX } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function BillingPage() {
    const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [filterType, setFilterType] = useState<"all" | "day" | "month" | "year">("all")
    const [selectedDate, setSelectedDate] = useState<string>("")

    const fetchInvoices = async () => {
        setLoading(true)
        try {
            const { data, error } = await InvoiceService.getAll()
            if (error) throw error
            setInvoices(data || [])
        } catch (error: any) {
            console.error("Error fetching invoices:", error)
            toast.error("Failed to load invoices")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInvoices()
    }, [])

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            draft: "outline",
            sent: "secondary",
            paid: "default",
            overdue: "destructive",
            cancelled: "outline",
        }
        const colors: Record<string, string> = {
            draft: "text-gray-600",
            sent: "text-blue-600",
            paid: "text-green-600",
            overdue: "text-red-600",
            cancelled: "text-gray-400",
        }
        return (
            <Badge variant={variants[status] || "default"} className={colors[status]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        )
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR'
        }).format(amount)
    }

    const filteredInvoices = invoices.filter((invoice) => {
        if (filterType === "all" || !selectedDate) return true

        const invoiceDate = new Date(invoice.issue_date)
        const selected = new Date(selectedDate)

        if (filterType === "day") {
            return (
                invoiceDate.getFullYear() === selected.getFullYear() &&
                invoiceDate.getMonth() === selected.getMonth() &&
                invoiceDate.getDate() === selected.getDate()
            )
        }

        if (filterType === "month") {
            // HTML month input returns YYYY-MM
            const [year, month] = selectedDate.split("-").map(Number)
            return (
                invoiceDate.getFullYear() === year &&
                invoiceDate.getMonth() === month - 1
            )
        }

        if (filterType === "year") {
            return invoiceDate.getFullYear() === Number(selectedDate)
        }

        return true
    })

    const resetFilters = () => {
        setFilterType("all")
        setSelectedDate("")
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
                    <p className="text-muted-foreground">
                        Manage invoices and track payments.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/billing/new">
                        <Plus className="mr-2 h-4 w-4" /> Create Invoice
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Invoices</CardTitle>
                    <CardDescription>
                        A list of all invoices created for your clients.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Filter Controls */}
                    <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/30 rounded-lg border border-primary/5">
                        <div className="w-full md:w-48">
                            <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Filter Type</label>
                            <Select value={filterType} onValueChange={(value: any) => {
                                setFilterType(value)
                                setSelectedDate("")
                            }}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Filter by..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="day">By Day</SelectItem>
                                    <SelectItem value="month">By Month</SelectItem>
                                    <SelectItem value="year">By Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {filterType !== "all" && (
                            <div className="w-full md:w-64 animate-in fade-in slide-in-from-left-2">
                                <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">
                                    Select {filterType === "day" ? "Date" : filterType === "month" ? "Month" : "Year"}
                                </label>
                                {filterType === "day" && (
                                    <Input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="bg-white"
                                    />
                                )}
                                {filterType === "month" && (
                                    <Input
                                        type="month"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="bg-white"
                                    />
                                )}
                                {filterType === "year" && (
                                    <Input
                                        type="number"
                                        placeholder="YYYY"
                                        min="2000"
                                        max="2100"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="bg-white"
                                    />
                                )}
                            </div>
                        )}

                        {(filterType !== "all" || selectedDate) && (
                            <div className="flex items-end">
                                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground h-10">
                                    <FilterX className="h-4 w-4 mr-2" />
                                    Clear
                                </Button>
                            </div>
                        )}
                    </div>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            No invoices found. Create one to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Case</TableHead>
                                    <TableHead>Issue Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                        <TableCell>{invoice.clients?.name || "-"}</TableCell>
                                        <TableCell>{invoice.cases?.title || "-"}</TableCell>
                                        <TableCell>{new Date(invoice.issue_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-semibold">{formatCurrency(invoice.total)}</TableCell>
                                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/dashboard/billing/${invoice.id}`}>View</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
