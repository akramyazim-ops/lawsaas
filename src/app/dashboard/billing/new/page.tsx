"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { InvoiceService } from "@/services/invoice-service"
import { ClientService } from "@/services/client-service"
import { CaseService } from "@/services/case-service"
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

export default function NewInvoicePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<Client[]>([])
    const [cases, setCases] = useState<CaseWithClient[]>([])
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            client_id: undefined,
            case_id: undefined,
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
        async function fetchData() {
            const [clientsRes, casesRes] = await Promise.all([
                ClientService.getAll(),
                CaseService.getAll(),
            ])
            setClients(clientsRes.data || [])
            setCases(casesRes.data || [])
        }
        fetchData()
    }, [])

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

            toast.success("Invoice created successfully")
            router.push(`/dashboard/billing/${invoice.id}`)
        } catch (error: any) {
            toast.error(error.message || "Failed to create invoice")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/billing">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Create Invoice</h2>
                    <p className="text-muted-foreground">Fill in the details to create a new invoice.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="client_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Client (Optional)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select client" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {clients.map((client) => (
                                                        <SelectItem key={client.id} value={client.id}>
                                                            {client.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="case_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Case (Optional)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select case" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {cases.map((caseItem) => (
                                                        <SelectItem key={caseItem.id} value={caseItem.id}>
                                                            {caseItem.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Additional notes..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Dates & Tax</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="issue_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Issue Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="due_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Due Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tax_rate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tax Rate (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="logo_url"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Brand Logo</FormLabel>
                                            <FormControl>
                                                <div className="space-y-4">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
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
                                                        <div className="mt-2 border rounded-md p-2 w-fit">
                                                            <img
                                                                src={logoPreview}
                                                                alt="Logo preview"
                                                                className="h-20 w-auto object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        Upload your law firm's logo for professional branding.
                                                    </p>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Items</CardTitle>
                            <CardDescription>Add items or services to this invoice.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-start">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                {index === 0 && <FormLabel>Description</FormLabel>}
                                                <FormControl>
                                                    <Input placeholder="Legal consultation..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem className="w-24">
                                                {index === 0 && <FormLabel>Qty</FormLabel>}
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="1" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.unit_price`}
                                        render={({ field }) => (
                                            <FormItem className="w-32">
                                                {index === 0 && <FormLabel>Unit Price</FormLabel>}
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="w-32">
                                        {index === 0 && <FormLabel>Amount</FormLabel>}
                                        <div className="h-10 flex items-center font-medium">
                                            RM {(parseFloat(form.watch(`items.${index}.quantity`) || "0") *
                                                parseFloat(form.watch(`items.${index}.unit_price`) || "0")).toFixed(2)}
                                        </div>
                                    </div>

                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className={index === 0 ? "mt-8" : ""}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ description: "", quantity: "1", unit_price: "0" })}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span className="font-medium">RM {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax ({form.watch("tax_rate")}%):</span>
                                    <span className="font-medium">RM {taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>Total:</span>
                                    <span>RM {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4 justify-end">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/dashboard/billing">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Invoice"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
