"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { CaseWithClient } from "@/types/case"
import { Document } from "@/types/document"
import { CaseService } from "@/services/case-service"
import { DocumentService } from "@/services/document-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Trash2, User, FileText, Loader2, Receipt } from "lucide-react"
import { InvoiceService } from "@/services/invoice-service"
import { InvoiceWithDetails } from "@/types/invoice"
import Link from "next/link"
import { DocumentUpload } from "@/components/documents/document-upload"
import { DocumentList } from "@/components/documents/document-list"
import { EditCaseDialog } from "@/components/cases/edit-case-dialog"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export default function CaseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [caseData, setCaseData] = useState<CaseWithClient | null>(null)
    const [documents, setDocuments] = useState<Document[]>([])
    const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
    const [loading, setLoading] = useState(true)

    const fetchDocuments = async () => {
        try {
            const { data, error } = await DocumentService.getByCaseId(id)
            if (error) throw error
            setDocuments(data || [])
        } catch (error: any) {
            console.error("Error fetching documents:", error)
        }
    }

    const fetchInvoices = async () => {
        try {
            const { data, error } = await InvoiceService.getByCaseId(id)
            if (error) throw error
            setInvoices(data || [])
        } catch (error: any) {
            console.error("Error fetching invoices:", error)
        }
    }

    const fetchCase = async () => {
        try {
            const { data, error } = await CaseService.getById(id)
            if (error) throw error
            setCaseData(data)
            await Promise.all([
                fetchDocuments(),
                fetchInvoices()
            ])
        } catch (error: any) {
            toast.error("Failed to load case details")
            router.push("/dashboard/cases")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            fetchCase()
        }
    }, [id, router])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this case?")) return
        try {
            const { error } = await CaseService.delete(id)
            if (error) throw error
            toast.success("Case deleted")
            router.push("/dashboard/cases")
        } catch (error) {
            toast.error("Failed to delete case")
        }
    }

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={cn(
                "capitalize text-[10px] font-black px-4 py-1.5 rounded-none border-none tracking-[0.2em] shadow-sm",
                status === 'open' ? "bg-primary text-black gold-glow" : "bg-muted text-muted-foreground/60"
            )}>
                {status}
            </Badge>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!caseData) return <div className="p-8">Case not found</div>

    return (
        <div className="p-8 space-y-10 selection:bg-primary/30 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center gap-6 pb-6 border-b border-white/5"
            >
                <Button variant="outline" size="icon" asChild className="rounded-none border-primary/20 hover:bg-primary hover:text-black transition-all h-12 w-12 shrink-0">
                    <Link href="/dashboard/cases">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Matter Ledger</span>
                        {getStatusBadge(caseData.status)}
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">{caseData.title}</h2>
                </div>
                <div className="flex gap-4">
                    <div className="flex bg-muted/10 p-1 architectural-border">
                        {(['open', 'pending', 'closed'] as const).map((status) => (
                            <Button
                                key={status}
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                    try {
                                        const { error } = await CaseService.update(caseData.id, { status })
                                        if (error) throw error
                                        toast.success(`Matter status updated to ${status}`)
                                        fetchCase()
                                    } catch (error) {
                                        toast.error("Failed to update status")
                                    }
                                }}
                                className={cn(
                                    "h-10 px-4 text-[9px] font-black uppercase tracking-[0.2em] rounded-none transition-all",
                                    caseData.status === status
                                        ? "bg-primary text-black gold-glow hover:bg-primary hover:text-black"
                                        : "hover:bg-primary/10 text-muted-foreground/60"
                                )}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                    <EditCaseDialog caseData={caseData} onCaseUpdated={fetchCase} />
                    <Button variant="ghost" size="sm" onClick={handleDelete} className="h-12 px-6 font-black uppercase tracking-[0.2em] text-destructive hover:bg-destructive hover:text-white rounded-none transition-all">
                        <Trash2 className="mr-2 h-4 w-4" /> Terminate Matter
                    </Button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="grid gap-8 md:grid-cols-3"
            >
                <Card className="md:col-span-2 architectural-border bg-muted/5 border-muted/20 shadow-none rounded-none overflow-hidden">
                    <CardHeader className="border-b border-muted/20 bg-muted/10 pb-6 px-8">
                        <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase italic">Matter Briefing</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="relative">
                            <div className="absolute -left-4 top-0 bottom-0 w-px bg-primary/20"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block">Objective & Description</p>
                            <p className="text-lg leading-relaxed text-foreground/80 font-medium italic">
                                {caseData.description || "No formal brief provided for this matter."}
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-muted/20">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1 block">Inception Date</p>
                                <p className="text-md font-black text-foreground uppercase tracking-tight">{new Date(caseData.created_at).toLocaleString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1 block">Registry Modification</p>
                                <p className="text-md font-black text-foreground uppercase tracking-tight">{new Date(caseData.updated_at).toLocaleString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="architectural-border bg-muted/5 border-muted/20 shadow-none rounded-none overflow-hidden h-fit">
                    <CardHeader className="border-b border-muted/20 bg-muted/10 pb-6 px-8">
                        <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase italic flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" /> Client Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        {caseData.clients ? (
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block">Primary Representative</p>
                                    <p className="text-2xl font-black text-foreground tracking-tighter uppercase italic">{caseData.clients.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1 block">Official Correspondence</p>
                                    <p className="text-md font-black text-primary/80 tracking-tight">{caseData.clients.email || "Confidential"}</p>
                                </div>
                                <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-[0.2em] h-12 border-primary/20 hover:bg-primary hover:text-black transition-all rounded-none mt-4" asChild>
                                    <Link href={`/dashboard/clients/${caseData.clients.id}`}>Full Relationship Profile</Link>
                                </Button>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">Client association pending.</p>
                        )}
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
                                    <Link href={`/dashboard/billing/new?caseId=${id}&clientId=${caseData.client_id}`}>Generate New Audit</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="architectural-border border-dashed border-primary/30 p-8 bg-primary/[0.02] flex flex-col items-center justify-center text-center">
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">No financial records registered for this matter.</p>
                                <Button variant="outline" className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] h-10 border-primary/20 hover:bg-primary hover:text-black transition-all rounded-none" asChild>
                                    <Link href={`/dashboard/billing/new?caseId=${id}&clientId=${caseData.client_id}`}>Initiate First Audit</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="architectural-border bg-muted/5 border-muted/20 shadow-none rounded-none overflow-hidden">
                    <CardHeader className="border-b border-muted/20 bg-muted/10 pb-6 px-8 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-black text-foreground tracking-tighter uppercase italic flex items-center gap-2">
                                <FileText className="h-6 w-6 text-primary" /> Repository
                            </CardTitle>
                            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Official documentation and assets.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <Tabs defaultValue="list" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-muted/10 rounded-none border border-white/5 h-14 p-1">
                                <TabsTrigger value="list" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-black text-[10px] font-black uppercase tracking-[0.2em]">Registry ({documents.length})</TabsTrigger>
                                <TabsTrigger value="upload" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-black text-[10px] font-black uppercase tracking-[0.2em]">Add Asset</TabsTrigger>
                            </TabsList>
                            <TabsContent value="list" className="mt-8">
                                <DocumentList documents={documents} onDocumentDeleted={fetchDocuments} />
                            </TabsContent>
                            <TabsContent value="upload" className="mt-8">
                                <div className="architectural-border border-dashed border-primary/30 p-12 bg-primary/[0.02]">
                                    <DocumentUpload caseId={id} onUploadComplete={fetchDocuments} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
