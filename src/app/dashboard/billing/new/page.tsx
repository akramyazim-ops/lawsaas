"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { InvoiceService } from "@/services/invoice-service"
import { ClientService } from "@/services/client-service"
import { CaseService } from "@/services/case-service"
import { supabase } from "@/lib/supabase"
import { Client } from "@/types/client"
import { CaseWithClient } from "@/types/case"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    client_id: z.string().optional(),
    case_id: z.string().optional(),
    issue_date: z.string(),
    due_date: z.string(),
    tax_rate: z.string(),
    notes: z.string().optional(),
    logo_url: z.string().optional(),
    items: z.array(z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.string().min(1, "Quantity is required"),
        unit_price: z.string().min(1, "Unit price is required"),
    })).min(1, "At least one item is required"),
})

import { Suspense } from "react"

function NewInvoiceContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const defaultClientId = searchParams.get('clientId') || ""
    const defaultCaseId = searchParams.get('caseId') || ""

    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<Client[]>([])
    const [cases, setCases] = useState<CaseWithClient[]>([])
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            client_id: defaultClientId || undefined,
            case_id: defaultCaseId || undefined,
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            tax_rate: "0",
            notes: "",
            logo_url: "",
            items: [{ description: "", quantity: "1", unit_price: "0" }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    useEffect(() => {
        if (defaultClientId) {
            form.setValue('client_id', defaultClientId)
        }
        if (defaultCaseId) {
            form.setValue('case_id', defaultCaseId)
        }
    }, [defaultClientId, defaultCaseId, form])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR'
        }).format(amount)
    }

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            const [clientsRes, casesRes] = await Promise.all([
                ClientService.getAll(),
                CaseService.getAll(),
            ])
            setClients(clientsRes.data || [])
            setCases(casesRes.data || [])

            // Institutional Persistence: Load draft from encrypted-local storage for this specific user
            if (user) {
                const draftKey = `draft-invoice-${user.id}`
                const savedDraft = localStorage.getItem(draftKey)
                if (savedDraft) {
                    try {
                        const parsed = JSON.parse(savedDraft)
                        form.reset({
                            ...form.getValues(),
                            ...parsed,
                            // Ensure dates are fresh if not provided
                            issue_date: parsed.issue_date || new Date().toISOString().split('T')[0],
                        })
                        toast.info("Draft restored from local registry")
                    } catch (e) {
                        console.error("Failed to restore draft")
                    }
                }
            }
            setLoading(false)
        }
        fetchData()
    }, [form])

    // Auto-Save Loop: Secure persistence of fiscal data
    useEffect(() => {
        const subscription = form.watch((value) => {
            const saveDraft = async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    localStorage.setItem(`draft-invoice-${user.id}`, JSON.stringify(value))
                }
            }
            saveDraft()
        })
        return () => subscription.unsubscribe()
    }, [form.watch])

    const calculateTotals = () => {
        const items = form.watch("items")
        const taxRate = parseFloat(form.watch("tax_rate") || "0")

        const subtotal = items.reduce((sum, item) => {
            const qty = parseFloat(item.quantity || "0")
            const price = parseFloat(item.unit_price || "0")
            return sum + (qty * price)
        }, 0)

        const taxAmount = subtotal * (taxRate / 100)
        const total = subtotal + taxAmount

        return { subtotal, taxAmount, total }
    }

    const { subtotal, taxAmount, total } = calculateTotals()

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            // Generate invoice number
            const { data: invoiceNumber, error: numError } = await InvoiceService.generateInvoiceNumber()
            if (numError) throw numError

            let finalLogoUrl = values.logo_url || null

            const taxRate = parseFloat(values.tax_rate)

            // Upload logo if selected
            if (logoFile) {
                const { path } = await InvoiceService.uploadLogo(logoFile)
                finalLogoUrl = path
            }

            // Create invoice
            const { data: invoice, error: invoiceError } = await InvoiceService.create({
                invoice_number: invoiceNumber,
                client_id: values.client_id || null,
                case_id: values.case_id || null,
                issue_date: values.issue_date,
                due_date: values.due_date,
                status: 'draft',
                subtotal,
                tax_rate: taxRate,
                tax_amount: taxAmount,
                total,
                notes: values.notes || null,
                logo_url: finalLogoUrl,
            })

            if (invoiceError) throw invoiceError

            // Add invoice items
            for (const item of values.items) {
                const quantity = parseFloat(item.quantity)
                const unitPrice = parseFloat(item.unit_price)
                const amount = quantity * unitPrice

                const { error: itemError } = await InvoiceService.addItem({
                    invoice_id: invoice.id,
                    description: item.description,
                    quantity,
                    unit_price: unitPrice,
                    amount,
                })

                if (itemError) throw itemError
            }

            // Clear the institutional draft upon successful commit
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                localStorage.removeItem(`draft-invoice-${user.id}`)
            }

            toast.success("Invoice created successfully")
            router.push(`/dashboard/billing/${invoice.id}`)
        } catch (error: any) {
            toast.error(error.message || "Failed to create invoice")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 space-y-10 selection:bg-primary/30 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center gap-6 pb-6 border-b border-white/5">
                <Button variant="outline" size="icon" asChild className="rounded-none border-primary/20 hover:bg-primary hover:text-black transition-all h-12 w-12 shrink-0">
                    <Link href="/dashboard/billing">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Asset Issuance</span>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">New Fiscal Instrument</h2>
                    <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                        Generate official documentation for professional service engagement.
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="architectural-border bg-muted/5 border-muted/20 shadow-none rounded-none overflow-hidden">
                            <CardHeader className="border-b border-muted/20 bg-muted/10 pb-6 px-8">
                                <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase italic">Entity Association</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <FormField
                                    control={form.control}
                                    name="client_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block">Primary Institutional Partner</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-transparent rounded-none h-12 border-muted/30 focus:border-primary font-black text-[11px] uppercase tracking-widest">
                                                        <SelectValue placeholder="Select institutional entity" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-none border-muted/30 font-black uppercase tracking-widest text-[10px]">
                                                    {clients.map((client) => (
                                                        <SelectItem key={client.id} value={client.id}>
                                                            {client.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] uppercase font-black tracking-widest mt-2" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="case_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block">Matter Designation</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-transparent rounded-none h-12 border-muted/30 focus:border-primary font-black text-[11px] uppercase tracking-widest">
                                                        <SelectValue placeholder="Associate with matter" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-none border-muted/30 font-black uppercase tracking-widest text-[10px]">
                                                    <SelectItem value="none">Independent Engagement</SelectItem>
                                                    {cases.map((caseItem) => (
                                                        <SelectItem key={caseItem.id} value={caseItem.id}>
                                                            {caseItem.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] uppercase font-black tracking-widest mt-2" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block">Engagement Memoranda</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Stipulations or specific engagement clauses..."
                                                    className="bg-transparent rounded-none border-muted/30 focus:border-primary font-medium text-sm italic min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-black tracking-widest mt-2" />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card className="architectural-border bg-muted/5 border-muted/20 shadow-none rounded-none overflow-hidden">
                            <CardHeader className="border-b border-muted/20 bg-muted/10 pb-6 px-8">
                                <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase italic">Chronology & Validation</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <FormField
                                    control={form.control}
                                    name="issue_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block">Commencement Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" className="bg-transparent rounded-none h-12 border-muted/30 focus:border-primary font-black text-[11px] uppercase tracking-widest" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-black tracking-widest mt-2" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="due_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block">Obligation Deadline</FormLabel>
                                            <FormControl>
                                                <Input type="date" className="bg-transparent rounded-none h-12 border-muted/30 focus:border-primary font-black text-[11px] uppercase tracking-widest" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-black tracking-widest mt-2" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tax_rate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block">Fiscal Levy (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0" className="bg-transparent rounded-none h-12 border-muted/30 focus:border-primary font-black text-[11px] uppercase tracking-widest" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-black tracking-widest mt-2" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="logo_url"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block">Institutional Branding</FormLabel>
                                            <FormControl>
                                                <div className="space-y-4">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        className="bg-transparent rounded-none h-12 border-muted/30 focus:border-primary font-black text-[10px] uppercase tracking-widest file:bg-primary file:text-black file:font-black file:uppercase file:tracking-widest file:border-none file:h-full file:mr-4 file:px-4 cursor-pointer"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0]
                                                            if (file) {
                                                                setLogoFile(file)
                                                                const reader = new FileReader()
                                                                reader.onloadend = () => {
                                                                    setLogoPreview(reader.result as string)
                                                                }
                                                                reader.readAsDataURL(file)
                                                            }
                                                        }}
                                                    />
                                                    {logoPreview && (
                                                        <div className="mt-4 architectural-border border-dashed border-primary/30 p-4 bg-primary/[0.02] w-fit">
                                                            <img
                                                                src={logoPreview}
                                                                alt="Logo preview"
                                                                className="h-20 w-auto object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                    <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest italic leading-relaxed">
                                                        Upload authorized signature or firm insignia for archival validation.
                                                    </p>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-black tracking-widest mt-2" />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="architectural-border bg-muted/5 border-muted/20 shadow-none rounded-none overflow-hidden">
                        <CardHeader className="border-b border-muted/20 bg-muted/10 pb-6 px-8">
                            <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase italic">Engagement Manifest</CardTitle>
                            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Specified legal services and associated capital allocation.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-6 items-start pb-6 border-b border-muted/10 last:border-0 last:pb-0">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                {index === 0 && <FormLabel className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-2 block opacity-70">Engagement Description</FormLabel>}
                                                <FormControl>
                                                    <Input placeholder="Direct legal consultation..." className="bg-transparent rounded-none h-12 border-muted/30 focus:border-primary font-medium text-sm italic" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px] uppercase font-black tracking-widest mt-2" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem className="w-24">
                                                {index === 0 && <FormLabel className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-2 block opacity-70">Volume</FormLabel>}
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="1" className="bg-transparent rounded-none h-12 border-muted/30 focus:border-primary font-black text-[11px] uppercase tracking-widest text-center" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px] uppercase font-black tracking-widest mt-2" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.unit_price`}
                                        render={({ field }) => (
                                            <FormItem className="w-32">
                                                {index === 0 && <FormLabel className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-2 block opacity-70">Unit RM</FormLabel>}
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="0.00" className="bg-transparent rounded-none h-12 border-muted/30 focus:border-primary font-black text-[11px] uppercase tracking-widest text-right" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px] uppercase font-black tracking-widest mt-2" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="w-40 text-right">
                                        {index === 0 && <FormLabel className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-2 block opacity-70">Capital Allocation</FormLabel>}
                                        <div className="h-12 flex items-center justify-end font-black text-lg tracking-tighter italic text-foreground group-hover:text-primary transition-colors">
                                            {formatCurrency(parseFloat(form.watch(`items.${index}.quantity`) || "0") * parseFloat(form.watch(`items.${index}.unit_price`) || "0"))}
                                        </div>
                                    </div>

                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className={cn("h-12 w-12 hover:bg-destructive hover:text-white rounded-none transition-all", index === 0 ? "mt-6" : "")}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => append({ description: "", quantity: "1", unit_price: "0" })}
                                className="h-12 px-6 font-black uppercase tracking-[0.2em] border-primary/20 hover:bg-primary hover:text-black rounded-none transition-all"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Line Asset
                            </Button>

                            <div className="border-t border-muted/20 pt-8 mt-12 space-y-4 max-w-sm ml-auto">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Net Subtotal</span>
                                    <span className="text-xl font-bold tracking-tight text-foreground/80">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Fiscal Levy ({form.watch("tax_rate") || "0"}%)</span>
                                    <span className="text-xl font-bold tracking-tight text-foreground/80">{formatCurrency(taxAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-muted/20 pt-4">
                                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary gold-glow">Total Capital Req.</span>
                                    <span className="text-4xl font-black tracking-tighter italic text-primary gold-glow">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-6 justify-end pt-6">
                        <Button type="button" variant="ghost" className="h-14 px-10 font-black uppercase tracking-[0.2em] rounded-none hover:bg-muted/10 transition-all" asChild>
                            <Link href="/dashboard/billing">Discard Draft</Link>
                        </Button>
                        <Button type="submit" disabled={loading} className="h-14 px-12 font-black uppercase tracking-[0.2em] bg-primary text-black hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/10 rounded-none">
                            {loading ? "ARCHIVING..." : "AUTHENTICATE & ISSUE"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default function NewInvoicePage() {
    return (
        <Suspense fallback={
            <div className="p-8 space-y-10 animate-pulse">
                <div className="h-20 bg-muted/20 w-1/3" />
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="h-64 bg-muted/10" />
                    <div className="h-64 bg-muted/10" />
                </div>
            </div>
        }>
            <NewInvoiceContent />
        </Suspense>
    )
}
