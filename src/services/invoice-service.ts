import { supabase } from "@/lib/supabase"
import { Invoice, InvoiceInsert, InvoiceUpdate, InvoiceItem, InvoiceItemInsert } from "@/types/invoice"

export const InvoiceService = {
    async getAll() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: new Error("Unauthorized") }

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
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
    },

    async getById(id: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error("Unauthorized") }

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
            .eq("user_id", user.id)
            .single()
    },

    async create(invoiceData: InvoiceInsert) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error("Unauthorized") }

        return await supabase
            .from("invoices")
            .insert({ ...invoiceData, user_id: user.id })
            .select()
            .single()
    },

    async update(id: string, invoiceData: InvoiceUpdate) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error("Unauthorized") }

        return await supabase
            .from("invoices")
            .update(invoiceData)
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single()
    },

    async getByClientId(clientId: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: new Error("Unauthorized") }

        return await supabase
            .from("invoices")
            .select(`
                *,
                clients (id, name, email),
                cases (id, title)
            `)
            .eq("client_id", clientId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
    },

    async getByCaseId(caseId: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: new Error("Unauthorized") }

        return await supabase
            .from("invoices")
            .select(`
                *,
                clients (id, name, email),
                cases (id, title)
            `)
            .eq("case_id", caseId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
    },

    async delete(id: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: new Error("Unauthorized") }

        return await supabase
            .from("invoices")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id)
    },

    async generateInvoiceNumber() {
        // RPC might need to be updated in SQL, but for now we call it
        const { data, error } = await supabase.rpc('generate_invoice_number')
        return { data, error }
    },

    // Invoice Items
    async addItem(itemData: InvoiceItemInsert) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error("Unauthorized") }

        return await supabase
            .from("invoice_items")
            .insert({ ...itemData, user_id: user.id })
            .select()
            .single()
    },

    async deleteItem(id: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: new Error("Unauthorized") }

        return await supabase
            .from("invoice_items")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id)
    },

    async getItemsByInvoiceId(invoiceId: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: new Error("Unauthorized") }

        return await supabase
            .from("invoice_items")
            .select("*")
            .eq("invoice_id", invoiceId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: true })
    },

    // Logo Upload
    async uploadLogo(file: File) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Unauthorized")

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/invoice-logos/${fileName}` // Isolate by user ID in path

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
