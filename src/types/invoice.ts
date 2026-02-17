export interface Invoice {
    id: string
    invoice_number: string
    client_id: string | null
    case_id: string | null
    issue_date: string
    due_date: string
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
    subtotal: number
    tax_rate: number
    tax_amount: number
    total: number
    notes: string | null
    logo_url: string | null
    created_at: string
    updated_at: string
}

export interface InvoiceItem {
    id: string
    invoice_id: string
    description: string
    quantity: number
    unit_price: number
    amount: number
    created_at: string
}

export type InvoiceInsert = Omit<Invoice, 'id' | 'created_at' | 'updated_at'>
export type InvoiceUpdate = Partial<InvoiceInsert>
export type InvoiceItemInsert = Omit<InvoiceItem, 'id' | 'created_at'>
export type InvoiceItemUpdate = Partial<InvoiceItemInsert>

export interface InvoiceWithDetails extends Invoice {
    clients?: {
        id: string
        name: string
        email: string | null
    } | null
    cases?: {
        id: string
        title: string
    } | null
    invoice_items?: InvoiceItem[]
}
