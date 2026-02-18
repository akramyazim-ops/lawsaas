"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { InvoiceWithDetails } from "@/types/invoice"
import { Client } from "@/types/client"
import { InvoiceService } from "@/services/invoice-service"
import { ClientService } from "@/services/client-service"
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
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export default function BillingPage() {
    const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [clients, setClients] = useState<Client[]>([])
    const [startDate, setStartDate] = useState<string>("")
    const [endDate, setEndDate] = useState<string>("")
    const [selectedClientId, setSelectedClientId] = useState<string>("all")

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

    const fetchClients = async () => {
        try {
            const { data } = await ClientService.getAll()
            setClients(data || [])
        } catch (error) {
            console.error("Error fetching clients:", error)
        }
    }

    useEffect(() => {
        fetchInvoices()
        fetchClients()
    }, [])

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            draft: "bg-muted text-muted-foreground/60",
            sent: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
            paid: "bg-primary/20 text-primary border border-primary/30 gold-glow",
            overdue: "bg-destructive/10 text-destructive border border-destructive/20",
            cancelled: "bg-muted/10 text-muted-foreground/40",
        }
        return (
            <Badge className={cn(
                "capitalize text-[9px] font-black px-3 py-1 rounded-none border-none tracking-[0.2em]",
                colors[status] || "bg-muted text-muted-foreground"
            )}>
                {status}
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
        // Client filter
        if (selectedClientId !== "all" && invoice.client_id !== selectedClientId) {
            return false
        }

        // Date range filter
        if (startDate || endDate) {
            const invoiceDate = new Date(invoice.issue_date)
            invoiceDate.setHours(0, 0, 0, 0)

            if (startDate) {
                const start = new Date(startDate)
                start.setHours(0, 0, 0, 0)
                if (invoiceDate < start) return false
            }

            if (endDate) {
                const end = new Date(endDate)
                end.setHours(23, 59, 59, 999)
                if (invoiceDate > end) return false
            }
        }

        return true
    })

    const resetFilters = () => {
        setStartDate("")
        setEndDate("")
        setSelectedClientId("all")
    }

    return (
        <div className="p-8 space-y-10 selection:bg-primary/30 min-h-screen">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Financial Registry</span>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">Billing & Revenue</h2>
                    <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                        Monitor the firm's fiscal health and transaction history with pioneer-grade precision.
                    </p>
                </div>
                <Button asChild className="h-14 px-8 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/10 rounded-none bg-primary text-black hover:bg-primary/90 transition-all active:scale-95">
                    <Link href="/dashboard/billing/new">
                        <Plus className="mr-2 h-5 w-5" /> Initiate Invoice
                    </Link>
                </Button>
            </motion.div>

            <Card className="architectural-border bg-muted/5 border-muted/20 shadow-none rounded-none overflow-hidden">
                <CardHeader className="border-b border-muted/20 bg-muted/10 pb-8 px-8">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-black text-foreground tracking-tighter uppercase italic">Transaction Ledger</CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                            A secure, immutable record of financial engagement.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0 text-white">
                    {/* Filter Controls */}
                    <div className="mx-8 my-10 grid grid-cols-1 md:grid-cols-4 gap-8 p-8 architectural-border bg-white/[0.02] items-end">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-2 block opacity-70">Entity Filtering</label>
                            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                <SelectTrigger className="bg-transparent rounded-none h-12 font-black uppercase tracking-widest border-muted/30 focus:border-primary transition-all text-[10px]">
                                    <SelectValue placeholder="All Entities" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-muted/30 font-black uppercase tracking-widest text-[10px]">
                                    <SelectItem value="all">All Entities</SelectItem>
                                    {clients.map(client => (
                                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-2 block opacity-70">Period Commencement</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent rounded-none h-12 border-muted/30 focus:border-primary font-black text-[11px] uppercase tracking-widest"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-2 block opacity-70">Period Conclusion</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent rounded-none h-12 border-muted/30 focus:border-primary font-black text-[11px] uppercase tracking-widest"
                            />
                        </div>

                        <div className="flex items-end h-12">
                            <Button
                                variant="ghost"
                                onClick={resetFilters}
                                className="text-[10px] font-black uppercase tracking-[0.2em] h-12 border-none hover:bg-primary hover:text-black transition-all rounded-none w-full"
                                disabled={!startDate && !endDate && selectedClientId === "all"}
                            >
                                <FilterX className="h-4 w-4 mr-2" />
                                Reset Matrix
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-24">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/10">
                                    <TableRow className="hover:bg-transparent border-muted/20">
                                        <TableHead className="py-6 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 px-8">Serial #</TableHead>
                                        <TableHead className="py-6 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60">Entity</TableHead>
                                        <TableHead className="py-6 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60">Registry Matter</TableHead>
                                        <TableHead className="py-6 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60">Verification</TableHead>
                                        <TableHead className="py-6 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60">Timeline</TableHead>
                                        <TableHead className="py-6 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/60 text-right px-8">Capital</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInvoices.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-20 text-muted-foreground font-black uppercase tracking-widest opacity-30 italic">
                                                No records found within current parameters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredInvoices.map((invoice) => (
                                            <TableRow key={invoice.id} className="group hover:bg-primary/[0.03] transition-colors border-muted/10">
                                                <TableCell className="font-black text-foreground px-8 py-8 group-hover:text-primary transition-colors tracking-tighter italic">
                                                    <div className="flex flex-col">
                                                        <span>{invoice.invoice_number}</span>
                                                        <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest not-italic">Ref: {invoice.id.slice(0, 8)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-black text-foreground/80 uppercase tracking-tight text-xs">{invoice.clients?.name || "Independent Case"}</TableCell>
                                                <TableCell className="font-bold text-muted-foreground/60 italic truncate max-w-[200px]">{invoice.cases?.title || "Direct Engagement"}</TableCell>
                                                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <CalendarIcon className="h-3 w-3 text-primary/40" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">ISS: {new Date(invoice.issue_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-3 w-3" />
                                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] border-l border-muted/20 pl-2">DUE: {new Date(invoice.due_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right px-8 py-6">
                                                    <div className="flex flex-col items-end gap-3">
                                                        <span className="text-2xl font-black text-foreground tracking-tighter italic group-hover:text-primary transition-colors gold-glow">{formatCurrency(invoice.total)}</span>
                                                        <Button variant="outline" size="sm" className="h-9 text-[9px] font-black uppercase tracking-[0.2em] border-primary/20 hover:bg-primary hover:text-black rounded-none px-4 transition-all" asChild>
                                                            <Link href={`/dashboard/billing/${invoice.id}`}>Audit Statement</Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
