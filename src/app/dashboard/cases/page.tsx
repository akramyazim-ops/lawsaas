"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { CaseWithClient } from "@/types/case"
import { CaseService } from "@/services/case-service"
import { AddCaseDialog } from "@/components/cases/add-case-dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Loader2,
    ArrowRight,
    Search,
    ChevronDown,
    RotateCw,
    Briefcase
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function CasesPage() {
    const [cases, setCases] = useState<CaseWithClient[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")

    const fetchCases = async () => {
        setLoading(true)
        try {
            const { data, error } = await CaseService.getAll()
            if (error) throw error
            setCases(data || [])
        } catch (error: any) {
            console.error("Error fetching cases:", error)
            toast.error("Failed to load cases. Please ensure the database is set up.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCases()
    }, [])

    // Filter Logic for Easy Access
    const filteredCases = cases.filter(caseItem => {
        const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (caseItem.clients?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || caseItem.status === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    })

    const getStatusBadge = (status: string) => {
        return (
            <div className={cn(
                "flex items-center justify-center w-20 h-7 rounded-none border transition-all gold-glow",
                status === 'open' ? "bg-primary/20 border-primary/30 text-primary" : "bg-muted/10 border-muted/20 text-muted-foreground/60"
            )}>
                <span className="text-[9px] font-black uppercase tracking-widest">{status}</span>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-10 selection:bg-primary/30 min-h-screen">
            {/* Header Section - Systematic & Clean */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-black tracking-[0.2em] border-primary/20 bg-primary/5 text-primary rounded-none px-2 py-0">MATTER MANAGEMENT</Badge>
                        <div className="h-px w-8 bg-primary/20"></div>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none flex items-center gap-4">
                        <Briefcase className="h-9 w-9 text-primary" /> Matters Registry
                    </h2>
                    <p className="text-muted-foreground font-medium text-sm tracking-wide max-w-2xl">
                        A definitive archive of all current legal engagements and firm caseload.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <AddCaseDialog onCaseAdded={fetchCases} />
                </div>
            </motion.div>

            {/* Tactical Search & Filter Bar */}
            <div className="grid gap-4 md:grid-cols-12">
                <div className="md:col-span-8 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="SEARCH BY CASE TITLE OR CLIENT ENTITY..."
                        className="w-full h-14 bg-card/40 border border-border px-12 text-[10px] font-black uppercase tracking-[0.15em] focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/30 selection:bg-primary/30"
                    />
                </div>
                <div className="md:col-span-4 flex gap-4">
                    <div className="flex-1 relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full h-14 bg-card/40 border border-border px-6 text-[10px] font-black uppercase tracking-[0.2em] appearance-none focus:border-primary focus:outline-none cursor-pointer"
                        >
                            <option value="All">Status: All</option>
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 pointer-events-none" />
                    </div>
                    <Button
                        variant="outline"
                        onClick={fetchCases}
                        className="h-14 w-14 border-primary/20 hover:bg-primary hover:text-black rounded-none transition-all"
                    >
                        <RotateCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Case Registry Table */}
            <Card className="architectural-border bg-card border-border shadow-none rounded-none overflow-hidden">
                <div className="border-b border-border bg-black px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-primary"></div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">Operational Compendium</h3>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Live Filter Results: {filteredCases.length}</span>
                </div>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-32">
                            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-black/50">
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="py-6 font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground/60 px-8">Engagement Title</TableHead>
                                        <TableHead className="py-6 font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground/60">Primary Entity</TableHead>
                                        <TableHead className="py-6 font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground/60">Legal Services</TableHead>
                                        <TableHead className="py-6 font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground/60 text-center">Current Status</TableHead>
                                        <TableHead className="py-6 font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground/60">Inception</TableHead>
                                        <TableHead className="py-6 font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground/60 text-right px-8">Operations</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCases.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-32 text-muted-foreground/30 font-black uppercase tracking-[0.4em] italic text-[11px]">
                                                No matters matching the current trajectory parameters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCases.map((caseItem) => (
                                            <TableRow key={caseItem.id} className="group hover:bg-primary/[0.02] transition-colors border-border/30">
                                                <TableCell className="font-black text-foreground px-8 py-8 group-hover:text-primary transition-colors tracking-tighter italic text-xl uppercase italic">
                                                    {caseItem.title}
                                                </TableCell>
                                                <TableCell className="font-bold text-muted-foreground tracking-widest text-[11px] uppercase">
                                                    {caseItem.clients?.name || "-"}
                                                </TableCell>
                                                <TableCell className="text-[10px] font-black uppercase tracking-widest text-primary/70 max-w-[200px] truncate">
                                                    {caseItem.service_type || "Legal Consult"}
                                                </TableCell>
                                                <TableCell className="flex justify-center py-8">
                                                    {getStatusBadge(caseItem.status)}
                                                </TableCell>
                                                <TableCell className="text-[10px] font-black tracking-widest text-foreground/80 uppercase">
                                                    {new Date(caseItem.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                                                </TableCell>
                                                <TableCell className="text-right px-8 py-6">
                                                    <Button variant="outline" size="sm" className="h-12 text-[10px] font-black uppercase tracking-[0.2em] border-primary/20 hover:bg-primary hover:text-black rounded-none px-8 transition-all group-hover:border-primary/60" asChild>
                                                        <Link href={`/dashboard/cases/${caseItem.id}`} className="flex items-center gap-2">
                                                            Audit Brief <ArrowRight className="h-3.5 w-3.5" />
                                                        </Link>
                                                    </Button>
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
