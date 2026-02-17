import { supabase } from "@/lib/supabase"
import { Invoice, InvoiceInsert, InvoiceUpdate, InvoiceItem, InvoiceItemInsert } from "@/types/invoice"

export const InvoiceService = {
    async getAll() {
        return await supabase
            .from("invoices")
            .select(`
                *,
                clients (
                    id,
                    name,
                    email
                ),
                cases (
                    id,
                    title
                )
            `)
            .order("created_at", { ascending: false })
    },

    async getById(id: string) {
        return await supabase
            .from("invoices")
            .select(`
                *,
                clients (
                    id,
                    name,
                    email
                ),
                cases (
                    id,
                    title
                ),
                invoice_items (
                    id,
                    description,
                    quantity,
                    unit_price,
                    amount
                )
            `)
            .eq("id", id)
            .single()
    },

    async create(invoiceData: InvoiceInsert) {
        return await supabase
            .from("invoices")
            .insert(invoiceData)
            .select()
            .single()
    },

    async update(id: string, invoiceData: InvoiceUpdate) {
        return await supabase
            .from("invoices")
            .update(invoiceData)
            .eq("id", id)
            .select()
            .single()
    },

    async delete(id: string) {
        return await supabase
            .from("invoices")
            .delete()
            .eq("id", id)
    },

    async generateInvoiceNumber() {
        const { data, error } = await supabase.rpc('generate_invoice_number')
        return { data, error }
    },

    // Invoice Items
    async addItem(itemData: InvoiceItemInsert) {
        return await supabase
            .from("invoice_items")
            .insert(itemData)
            .select()
            .single()
    },

    async deleteItem(id: string) {
        return await supabase
            .from("invoice_items")
            .delete()
            .eq("id", id)
    },

    async getItemsByInvoiceId(invoiceId: string) {
        return await supabase
            .from("invoice_items")
            .select("*")
            .eq("invoice_id", invoiceId)
            .order("created_at", { ascending: true })
    },

    // Logo Upload
    async uploadLogo(file: File) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `invoice-logos/${fileName}`

        const { data, error } = await supabase.storage
            .from('case-documents')
            .upload(filePath, file)

        if (error) throw error
        return { path: data.path }
    },

    async getLogoUrl(path: string) {
        const { data } = supabase.storage
            .from('case-documents')
            .getPublicUrl(path)
        return data.publicUrl
    }
}
