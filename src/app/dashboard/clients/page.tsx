"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Client } from "@/types/client"
import { ClientService } from "@/services/client-service"
import { AddClientDialog } from "@/components/clients/add-client-dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Loader2,
    Search,
    ChevronDown,
    ChevronRight,
    Users,
    RotateCw,
    Settings,
    MoreHorizontal,
    Link as LinkIcon
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [jurisdictionFilter, setJurisdictionFilter] = useState("All")

    const fetchClients = async () => {
        setLoading(true)
        try {
            const { data, error } = await ClientService.getAll()
            if (error) throw error
            setClients(data || [])
        } catch (error: any) {
            console.error("Error fetching clients:", error)
            toast.error("Failed to load clients. Please ensure the database is set up.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClients()
    }, [])

    // Filter Logic for Easy Access
    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.email || "").toLowerCase().includes(searchTerm.toLowerCase());
        const jurisdiction = client.address ? client.address.substring(0, 2).toUpperCase() : "MY";
        const matchesJurisdiction = jurisdictionFilter === "All" || jurisdiction === jurisdictionFilter;
        return matchesSearch && matchesJurisdiction;
    })

    const uniqueJurisdictions = Array.from(new Set(clients.map(c => c.address ? c.address.substring(0, 2).toUpperCase() : "MY")))

    return (
        <div className="p-8 space-y-10 selection:bg-primary/30 min-h-screen bg-background text-foreground">
            {/* Header Section - Systematic & Clean */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-black tracking-[0.2em] border-primary/20 bg-primary/5 text-primary rounded-none px-2 py-0">REGISTRY MODULE</Badge>
                        <div className="h-px w-8 bg-primary/20"></div>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none flex items-center gap-4">
                        <Users className="h-9 w-9 text-primary" /> Client Portfolio
                    </h2>
                    <p className="text-muted-foreground font-medium text-sm tracking-wide max-w-2xl">
                        A systematic record of institutional entities and high-priority strategic contacts.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <AddClientDialog onClientAdded={fetchClients} />
                </div>
            </motion.div>

            {/* Tactical Search & Filter Bar - Enhanced for Filter Feature */}
            <div className="grid gap-4 md:grid-cols-12">
                <div className="md:col-span-8 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="SEARCH BY NAME, CORPORATE EMAIL OR SERVICE..."
                        className="w-full h-14 bg-card/40 border border-border px-12 text-[10px] font-black uppercase tracking-[0.15em] focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/30 selection:bg-primary/30"
                    />
                </div>
                <div className="md:col-span-4 flex gap-4">
                    <div className="flex-1 relative">
                        <select
                            value={jurisdictionFilter}
                            onChange={(e) => setJurisdictionFilter(e.target.value)}
                            className="w-full h-14 bg-card/40 border border-border px-6 text-[10px] font-black uppercase tracking-[0.2em] appearance-none focus:border-primary focus:outline-none cursor-pointer"
                        >
                            <option value="All">Jurisdiction: All</option>
                            {uniqueJurisdictions.map(j => (
                                <option key={j} value={j}>{j}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 pointer-events-none" />
                    </div>
                    <Button
                        variant="outline"
                        onClick={fetchClients}
                        className="h-14 w-14 border-primary/20 hover:bg-primary hover:text-black rounded-none transition-all"
                    >
                        <RotateCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Institutional Registry Table - Readjusted to Image Spec */}
            <Card className="architectural-border bg-card border-border shadow-none rounded-none overflow-hidden">
                <div className="border-b border-border bg-black px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-primary"></div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">Operational Registry</h3>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Live Filter Results: {filteredClients.length}</span>
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
                                        <TableHead className="py-6 font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground/60">Current Status</TableHead>
                                        <TableHead className="py-6 font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground/60">Inception</TableHead>
                                        <TableHead className="py-6 font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground/60 text-right px-8">Operations</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredClients.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-32 text-muted-foreground/30 font-black uppercase tracking-[0.4em] italic text-[11px]">
                                                No results matching the current filter parameters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredClients.map((client) => {
                                            const normalizedDate = new Date(client.created_at).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            }).toUpperCase();

                                            return (
                                                <TableRow key={client.id} className="group hover:bg-primary/[0.02] transition-colors border-border/30">
                                                    <TableCell className="font-black text-foreground px-8 py-8 group-hover:text-primary transition-colors tracking-tighter italic text-xl uppercase">
                                                        {client.name}
                                                    </TableCell>
                                                    <TableCell className="font-bold text-muted-foreground tracking-widest text-[11px] uppercase">
                                                        {client.email ? client.email.split('@')[0] : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                                                        General Counsel
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center w-20 h-7 bg-primary/20 border border-primary/30 rounded-none">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Open</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-[10px] font-black tracking-widest text-foreground/80 uppercase">
                                                        {normalizedDate}
                                                    </TableCell>
                                                    <TableCell className="text-right px-8 py-6">
                                                        <Button variant="outline" size="sm" className="h-12 text-[10px] font-black uppercase tracking-[0.2em] border-primary/20 hover:bg-primary hover:text-black rounded-none px-8 transition-all group-hover:border-primary/60" asChild>
                                                            <Link href={`/dashboard/clients/${client.id}`} className="flex items-center gap-2">
                                                                Audit Brief <Search className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
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
