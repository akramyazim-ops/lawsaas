"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ClientService } from "@/services/client-service"
import { CaseService } from "@/services/case-service"
import { InvoiceService } from "@/services/invoice-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Mail, MapPin, Phone, Trash2, Receipt, Briefcase, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import { EditClientDialog } from "@/components/clients/edit-client-dialog"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Client } from "@/types/client"
import { Case } from "@/types/case"
import { InvoiceWithDetails } from "@/types/invoice"

export default function ClientDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [client, setClient] = useState<Client | null>(null)
    const [cases, setCases] = useState<Case[]>([])
    const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
    const [loading, setLoading] = useState(true)

    const fetchClientData = async () => {
        try {
            const [clientRes, casesRes, invoicesRes] = await Promise.all([
                ClientService.getById(id),
                CaseService.getByClientId(id),
                InvoiceService.getByClientId(id)
            ])

            if (clientRes.error) throw clientRes.error
            setClient(clientRes.data)
            setCases(casesRes.data || [])
            setInvoices(invoicesRes.data || [])
        } catch (error: any) {
            toast.error("Failed to load client details")
            router.push("/dashboard/clients")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            fetchClientData()
        }
    }, [id, router])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this client?")) return
        try {
            const { error } = await ClientService.delete(id)
            if (error) throw error
            toast.success("Client deleted")
            router.push("/dashboard/clients")
        } catch (error) {
            toast.error("Failed to delete client")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!client) return <div className="p-8">Client not found</div>

    return (
        <div className="p-8 space-y-10 selection:bg-primary/30 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center gap-6 pb-6 border-b border-white/5"
            >
                <Button variant="outline" size="icon" asChild className="rounded-none border-primary/20 hover:bg-primary hover:text-black transition-all h-12 w-12 shrink-0">
                    <Link href="/dashboard/clients">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Entity Portfolio</span>
                        <Badge className="bg-primary text-black gold-glow text-[10px] font-black px-4 py-1.5 rounded-none border-none tracking-[0.2em] shadow-sm uppercase">Active Partner</Badge>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">{client.name}</h2>
                </div>
                <div className="flex gap-4">
                    <EditClientDialog client={client} onClientUpdated={fetchClientData} />
                    <Button variant="ghost" size="sm" onClick={handleDelete} className="h-12 px-6 font-black uppercase tracking-[0.2em] text-destructive hover:bg-destructive hover:text-white rounded-none transition-all">
                        <Trash2 className="mr-2 h-4 w-4" /> Terminate Relationship
                    </Button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="grid gap-8 md:grid-cols-2"
            >
                <Card className="architectural-border bg-muted/5 border-muted/20 shadow-none rounded-none overflow-hidden">
                    <CardHeader className="border-b border-muted/20 bg-muted/10 pb-6 px-8">
                        <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase italic">Institutional Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center gap-4 group">
                            <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-black transition-all transition-colors duration-500">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Electronic Correspondence</p>
                                <p className="text-lg font-black tracking-tight text-foreground">{client.email || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-black transition-all transition-colors duration-500">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Direct Communication</p>
                                <p className="text-lg font-black tracking-tight text-foreground">{client.phone || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-black transition-all transition-colors duration-500">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Registered Address</p>
                                <p className="text-sm font-black tracking-tight text-foreground/80 italic">{client.address || "N/A"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="architectural-border bg-muted/5 border-muted/20 shadow-none rounded-none overflow-hidden h-fit">
                    <CardHeader className="border-b border-muted/20 bg-muted/10 pb-6 px-8">
                        <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase italic">Financial Registry</CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Monetary audit trail and ledgers.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        {invoices.length > 0 ? (
                            <div className="space-y-4">
                                {invoices.slice(0, 5).map((invoice) => (
                                    <Link
                                        key={invoice.id}
                                        href={`/dashboard/billing/${invoice.id}`}
                                        className="flex items-center justify-between p-4 architectural-border bg-white/[0.02] hover:bg-primary/[0.05] transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 architectural-border border-primary/20 text-primary group-hover:bg-primary group-hover:text-black transition-all">
                                                <Receipt className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm uppercase tracking-tight italic group-hover:text-primary transition-colors">{invoice.invoice_number}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                    {new Date(invoice.issue_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })} • {invoice.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-sm tracking-tighter italic text-foreground gold-glow">{new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(invoice.total)}</p>
                                        </div>
                                    </Link>
                                ))}
                                <Button variant="outline" className="w-full mt-4 text-[10px] font-black uppercase tracking-[0.2em] h-10 border-primary/20 hover:bg-primary hover:text-black transition-all rounded-none" asChild>
                                    <Link href={`/dashboard/billing/new?clientId=${id}`}>Generate New Audit</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="architectural-border border-dashed border-primary/30 p-8 bg-primary/[0.02] flex flex-col items-center justify-center text-center">
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">No financial records registered for this entity.</p>
                                <Button variant="outline" className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] h-10 border-primary/20 hover:bg-primary hover:text-black transition-all rounded-none" asChild>
                                    <Link href={`/dashboard/billing/new?clientId=${id}`}>Initiate First Audit</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="architectural-border bg-muted/5 border-muted/20 shadow-none rounded-none overflow-hidden h-fit">
                    <CardHeader className="border-b border-muted/20 bg-muted/10 pb-6 px-8">
                        <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase italic">Matter Engagement</CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Active and historical engagements.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        {cases.length > 0 ? (
                            <div className="space-y-4">
                                {cases.map((caseItem) => (
                                    <Link
                                        key={caseItem.id}
                                        href={`/dashboard/cases/${caseItem.id}`}
                                        className="flex items-center justify-between p-4 architectural-border bg-white/[0.02] hover:bg-primary/[0.05] transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 architectural-border border-primary/20 text-primary group-hover:bg-primary group-hover:text-black transition-all">
                                                <Briefcase className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm uppercase tracking-tight italic group-hover:text-primary transition-colors">{caseItem.title}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{caseItem.status}</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                    </Link>
                                ))}
                                <Button variant="outline" className="w-full mt-4 text-[10px] font-black uppercase tracking-[0.2em] h-10 border-primary/20 hover:bg-primary hover:text-black transition-all rounded-none" asChild>
                                    <Link href={`/dashboard/cases?clientId=${id}`}>Initiate New Matter</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="architectural-border border-dashed border-primary/30 p-8 bg-primary/[0.02] flex flex-col items-center justify-center text-center">
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">No active legal matters currently in session for this entity.</p>
                                <Button variant="outline" className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] h-10 border-primary/20 hover:bg-primary hover:text-black transition-all rounded-none" asChild>
                                    <Link href={`/dashboard/cases?clientId=${id}`}>Initiate New Matter</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
