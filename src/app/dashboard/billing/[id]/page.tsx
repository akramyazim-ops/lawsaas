"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { InvoiceWithDetails } from "@/types/invoice"
import { InvoiceService } from "@/services/invoice-service"
import { DocumentService } from "@/services/document-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Download, Trash2, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function InvoiceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [logoUrl, setLogoUrl] = useState<string | null>(null)
    const invoiceRef = useRef<HTMLDivElement>(null)

    const fetchInvoice = async () => {
        try {
            const { data, error } = await InvoiceService.getById(id)
            if (error) throw error
            setInvoice(data)

            // Resolve logo URL if it's a storage path
            if (data?.logo_url) {
                if (data.logo_url.startsWith('invoice-logos/')) {
                    try {
                        const { data: blob, error: downloadError } = await DocumentService.downloadFile(data.logo_url)
                        if (!downloadError && blob) {
                            const reader = new FileReader()
                            reader.onloadend = () => setLogoUrl(reader.result as string)
                            reader.readAsDataURL(blob)
                        } else {
                            // Fallback to public URL if download fails
                            const url = await InvoiceService.getLogoUrl(data.logo_url)
                            setLogoUrl(url)
                        }
                    } catch (err) {
                        const url = await InvoiceService.getLogoUrl(data.logo_url)
                        setLogoUrl(url)
                    }
                } else {
                    setLogoUrl(data.logo_url)
                }
            }
        } catch (error: any) {
            toast.error("Failed to load invoice")
            router.push("/dashboard/billing")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            fetchInvoice()
        }
    }, [id])

    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true)
        try {
            const { error } = await InvoiceService.update(id, { status: newStatus as any })
            if (error) throw error
            toast.success("Invoice status updated")
            fetchInvoice()
        } catch (error: any) {
            toast.error("Failed to update status")
        } finally {
            setUpdating(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this invoice?")) return
        try {
            const { error } = await InvoiceService.delete(id)
            if (error) throw error
            toast.success("Invoice deleted")
            router.push("/dashboard/billing")
        } catch (error) {
            toast.error("Failed to delete invoice")
        }
    }

    const handleDownloadPDF = async () => {
        if (!invoiceRef.current) return
        setDownloading(true)

        // SURGICAL FIX: Temporarily detach all document styles to bypass html2canvas's CSS parser crash
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
        const styleParents = styles.map(s => s.parentNode);
        const nextSiblings = styles.map(s => s.nextSibling);

        try {
            window.scrollTo(0, 0)
            await new Promise(resolve => setTimeout(resolve, 700))

            // Detach problematic styles
            styles.forEach(s => s.parentNode?.removeChild(s));

            const element = invoiceRef.current
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                onclone: (clonedDoc) => {
                    // Inject clean, hex-only styles into the clone
                    const style = clonedDoc.createElement('style');
                    style.innerHTML = `
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                        body { background: white !important; padding: 60px !important; display: flex !important; justify-content: center !important; font-family: 'Inter', sans-serif !important; }
                        * { box-sizing: border-box !important; }
                        .architectural-border { background: white !important; border: 1px solid #E2E8F0 !important; width: 1000px !important; min-height: 1200px !important; padding: 80px !important; position: relative !important; }
                        .text-primary { color: #00D1FF !important; }
                        .text-slate-900 { color: #0F172A !important; }
                        .text-slate-800 { color: #1E293B !important; }
                        .text-slate-600 { color: #475569 !important; }
                        .text-slate-500 { color: #64748B !important; }
                        .text-slate-400 { color: #94A3B8 !important; }
                        .bg-slate-50 { background-color: #F8FAFC !important; }
                        .border-slate-100 { border-color: #F1F5F9 !important; }
                        .border-top { border-top: 1px solid #F1F5F9 !important; }
                        table { width: 100% !important; border-collapse: collapse !important; margin-top: 40px !important; }
                        th { text-align: left !important; border-bottom: 2px solid #F1F5F9 !important; padding: 12px 0 !important; font-size: 10px !important; color: #94A3B8 !important; text-transform: uppercase !important; }
                        td { padding: 16px 0 !important; border-bottom: 1px solid #F8FAFC !important; font-size: 14px !important; color: #1E293B !important; }
                        .italic { font-style: italic !important; }
                        .font-black { font-weight: 900 !important; }
                        .font-bold { font-weight: 700 !important; }
                        .uppercase { text-transform: uppercase !important; }
                        .tracking-tighter { letter-spacing: -0.05em !important; }
                        .tracking-widest { letter-spacing: 0.1em !important; }
                        .gold-glow, .architectural-border::before, .grain, .watermark { display: none !important; }
                    `;
                    clonedDoc.head.appendChild(style);
                },
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
            })

            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF("p", "mm", "a4")
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const imgProps = pdf.getImageProperties(imgData)
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
            pdf.save(`invoice-${invoice?.invoice_number}.pdf`)
            toast.success("PDF downloaded successfully")
        } catch (error: any) {
            console.error("PDF generation error:", error)
            toast.error(`PDF Error: ${error.message || "Internal rendering error"}. Please try again.`)
        } finally {
            // Restore original styles
            styles.forEach((s, i) => {
                const parent = styleParents[i];
                const sibling = nextSiblings[i];
                if (parent) {
                    if (sibling) parent.insertBefore(s, sibling);
                    else parent.appendChild(s);
                }
            });
            setDownloading(false)
        }
    }

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

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    )
    if (!invoice) return (
        <div className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Entity Missing</h2>
            <p className="text-muted-foreground">The requested financial record could not be retrieved from the registry.</p>
            <Button variant="outline" asChild className="rounded-none border-primary/20">
                <Link href="/dashboard/billing">Return to Registry</Link>
            </Button>
        </div>
    )

    return (
        <div className="p-8 space-y-10 selection:bg-primary/30 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-6">
                    <Button variant="outline" size="icon" asChild className="rounded-none border-primary/20 hover:bg-primary hover:text-black transition-all h-12 w-12 shrink-0">
                        <Link href="/dashboard/billing">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Registry Audit</span>
                        <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">{invoice.invoice_number}</h2>
                        <div className="pt-2">{getStatusBadge(invoice.status)}</div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="h-12 px-6 font-black uppercase tracking-[0.2em] border-primary/20 hover:bg-primary hover:text-black rounded-none transition-all shadow-xl shadow-primary/5"
                    >
                        <Download className="mr-2 h-4 w-4" /> {downloading ? "rendering..." : "Authenticate PDF"}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        className="h-12 px-6 font-black uppercase tracking-[0.2em] text-destructive hover:bg-destructive hover:text-white rounded-none transition-all"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Terminate Record
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <div ref={invoiceRef} id="printable-invoice" className="architectural-border bg-white text-slate-950 p-12 lg:p-20 shadow-2xl relative overflow-hidden min-h-[1100px] flex flex-col">
                        {/* Legal Watermark Branding */}
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] select-none pointer-events-none">
                            <h1 className="text-8xl font-black tracking-tighter uppercase italic leading-none rotate-12">AUTHENTIC</h1>
                        </div>

                        {/* Invoice Header */}
                        <div className="flex justify-between items-start mb-20 relative z-10">
                            <div className="space-y-6">
                                {logoUrl ? (
                                    <div className="bg-slate-50 p-4 border border-slate-200">
                                        <img
                                            src={logoUrl}
                                            alt="Firm Insignia"
                                            className="h-20 w-auto object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900">LegalFlow <span className="text-primary italic">SaaS</span></h1>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Pioneer Legal Infrastructure</p>
                                    </div>
                                )}
                                <div className="space-y-1 pt-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Issuing Entity</p>
                                    <p className="text-xs font-bold text-slate-600 uppercase">Registry Office Alpha</p>
                                    <p className="text-xs text-slate-500 italic">123 Law Street, Legal City, 50000</p>
                                </div>
                            </div>
                            <div className="text-right space-y-4">
                                <div className="space-y-1">
                                    <h2 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900 leading-none">AUDIT</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Official Statement</p>
                                </div>
                                <div className="space-y-1 pt-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Document #</p>
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-widest italic">{invoice.invoice_number}</p>
                                </div>
                            </div>
                        </div>

                        {/* Partner Association */}
                        <div className="grid grid-cols-2 gap-12 mb-20 pt-10 border-t border-slate-100 relative z-10">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Partner</p>
                                {invoice.clients ? (
                                    <div className="space-y-1">
                                        <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{invoice.clients.name}</p>
                                        <p className="text-sm text-slate-500 italic lowercase">{invoice.clients.email || "registry@entity.missing"}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">Independent Engagement Profile</p>
                                )}
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Chronology</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Issue</p>
                                        <p className="text-xs font-bold text-slate-700">{new Date(invoice.issue_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Due</p>
                                        <p className="text-xs font-black text-primary italic">{new Date(invoice.due_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Engagement Manifest */}
                        <div className="flex-1 relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 pb-2 border-b border-slate-100">Engagement Manifest</h3>
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-0">Engagement description</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 text-center w-24">Vol</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 text-right w-32">Unit capital</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 text-right w-40">Allocation</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.invoice_items?.map((item) => (
                                        <TableRow key={item.id} className="border-slate-50 hover:bg-transparent">
                                            <TableCell className="py-6 px-0">
                                                <p className="text-sm font-bold text-slate-800 uppercase tracking-tight leading-tight mb-1">{item.description}</p>
                                                {invoice.cases && (
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Part of: {invoice.cases.title}</p>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-6 text-center text-sm font-bold text-slate-600">{item.quantity}</TableCell>
                                            <TableCell className="py-6 text-right text-sm font-bold text-slate-600 font-mono">{formatCurrency(item.unit_price)}</TableCell>
                                            <TableCell className="py-6 text-right text-base font-black text-slate-900 tracking-tighter italic font-mono">{formatCurrency(item.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Capital Summary */}
                        <div className="mt-20 pt-10 border-t-4 border-slate-900 flex justify-end relative z-10">
                            <div className="w-full max-w-sm space-y-4">
                                <div className="flex justify-between items-center text-slate-500">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Net subtotal</span>
                                    <span className="text-sm font-bold font-mono">{formatCurrency(invoice.subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500 pb-4 border-b border-slate-100">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Fiscal levy ({invoice.tax_rate}%)</span>
                                    <span className="text-sm font-bold font-mono">{formatCurrency(invoice.tax_amount)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Total req. capital</span>
                                    <span className="text-4xl font-black tracking-tighter italic text-slate-900 font-mono leading-none">{formatCurrency(invoice.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Audit Verification Footnote */}
                        <div className="mt-20 pt-10 border-t border-slate-100 grid grid-cols-2 gap-12 relative z-10">
                            <div className="space-y-4">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Stipulations & Notes</p>
                                <p className="text-xs text-slate-400 leading-relaxed italic pr-12">
                                    {invoice.notes || "This instrument represents a formal demand for payment by the issuing entity. Terms are governed by the primary professional service agreement."}
                                </p>
                            </div>
                            <div className="flex items-end justify-end space-y-1">
                                <div className="text-right">
                                    <div className="h-1 bg-slate-100 w-32 ml-auto mb-2 opacity-30" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Authorized Signature</p>
                                    <p className="text-[8px] font-bold text-slate-200 uppercase tracking-widest pt-2 italic">Cryptographically Validated Record</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <Card className="architectural-border bg-muted/5 border-muted/20 shadow-none rounded-none overflow-hidden h-fit">
                        <CardHeader className="border-b border-muted/20 bg-muted/10 pb-6 px-8">
                            <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase italic">Registry Protocol</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-2 block opacity-70">Current Validation State</label>
                                <Select
                                    value={invoice.status}
                                    onValueChange={handleStatusChange}
                                    disabled={updating}
                                >
                                    <SelectTrigger className="bg-transparent rounded-none h-14 border-muted/30 focus:border-primary font-black text-[11px] uppercase tracking-widest transition-all">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none border-muted/30 font-black uppercase tracking-widest text-[10px]">
                                        <SelectItem value="draft">Draft Protocol</SelectItem>
                                        <SelectItem value="sent">Dispatched</SelectItem>
                                        <SelectItem value="paid">Validated Capital</SelectItem>
                                        <SelectItem value="overdue">Default Breach</SelectItem>
                                        <SelectItem value="cancelled">Nullified</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-6 border-t border-muted/20 space-y-6">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Entity Identification</p>
                                    <p className="text-xs font-black uppercase tracking-tight text-foreground/80">{invoice.clients?.name || "Independent Partner"}</p>
                                </div>
                                {invoice.cases && (
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Associated Registry Matter</p>
                                        <p className="text-xs font-black uppercase tracking-tight text-foreground/80 leading-relaxed">{invoice.cases.title}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="architectural-border bg-muted/5 border-muted/20 shadow-none rounded-none overflow-hidden h-fit">
                        <CardHeader className="border-b border-muted/20 bg-muted/10 pb-6 px-8">
                            <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase italic">Action Stream</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <Button variant="outline" className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] border-primary/20 hover:bg-primary hover:text-black rounded-none transition-all flex items-center justify-between group" asChild>
                                <Link href="/dashboard/billing/new">
                                    <span>Initiate Secondary</span>
                                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
