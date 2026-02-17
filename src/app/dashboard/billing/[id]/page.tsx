"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { InvoiceWithDetails } from "@/types/invoice"
import { InvoiceService } from "@/services/invoice-service"
import { DocumentService } from "@/services/document-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ArrowLeft, Download, Trash2 } from "lucide-react"
import Link from "next/link"

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
        try {
            window.scrollTo(0, 0)
            await new Promise(resolve => setTimeout(resolve, 700))

            const element = invoiceRef.current
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                onclone: (clonedDoc) => {
                    const style = clonedDoc.createElement('style')
                    style.innerHTML = `
                        /* Force standard color types for capture */
                        * {
                            color-scheme: light !important;
                        }
                    `
                    clonedDoc.head.appendChild(style)
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
            setDownloading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            draft: "outline",
            sent: "secondary",
            paid: "default",
            overdue: "destructive",
            cancelled: "outline",
        }
        return (
            <Badge variant={variants[status] || "default"}>
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

    if (loading) return <div className="p-8">Loading...</div>
    if (!invoice) return <div className="p-8">Invoice not found</div>

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/billing">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight">Invoice {invoice.invoice_number}</h2>
                    <div className="mt-2">{getStatusBadge(invoice.status)}</div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={downloading}>
                        <Download className="mr-2 h-4 w-4" /> {downloading ? "Generating..." : "Download PDF"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                </div>
            </div>

            <div ref={invoiceRef} className="space-y-8 bg-white p-8 rounded-lg shadow-sm border">
                {/* Invoice Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">INVOICE</h1>
                        <p className="text-muted-foreground">{invoice.invoice_number}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">LegalFlow SaaS</p>
                        <p className="text-sm text-muted-foreground">123 Law Street, Legal City</p>
                        <p className="text-sm text-muted-foreground">contact@legalflow.com</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {logoUrl && (
                                <div className="mb-6 border rounded-md p-2 w-fit bg-gray-50/50">
                                    <img
                                        src={logoUrl}
                                        alt="Brand Logo"
                                        className="h-16 w-auto object-contain"
                                    />
                                </div>
                            )}
                            {invoice.clients ? (
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{invoice.clients.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p>{invoice.clients.email || "N/A"}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No client assigned</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Issue Date</p>
                                <p>{new Date(invoice.issue_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Due Date</p>
                                <p>{new Date(invoice.due_date).toLocaleDateString()}</p>
                            </div>
                            {invoice.cases && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Case</p>
                                    <p className="font-medium">{invoice.cases.title}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select
                                value={invoice.status}
                                onValueChange={handleStatusChange}
                                disabled={updating}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.invoice_items?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="mt-6 space-y-2 max-w-sm ml-auto">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax ({invoice.tax_rate}%):</span>
                                <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span>Total:</span>
                                <span>{formatCurrency(invoice.total)}</span>
                            </div>
                        </div>

                        {invoice.notes && (
                            <div className="mt-6 pt-6 border-t">
                                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                                <p className="text-sm">{invoice.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
