import { supabase } from "@/lib/supabase"
import { Document, DocumentInsert, DocumentUpdate } from "@/types/document"

export const DocumentService = {
    async getAll() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: new Error("Unauthorized") }

        return await supabase
            .from("documents")
            .select("*")
            .eq("uploaded_by", user.id)
            .order("created_at", { ascending: false })
    },

    async getByCaseId(caseId: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: new Error("Unauthorized") }

        return await supabase
            .from("documents")
            .select("*")
            .eq("case_id", caseId)
            .eq("uploaded_by", user.id)
            .order("created_at", { ascending: false })
    },

    async getById(id: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error("Unauthorized") }

        return await supabase
            .from("documents")
            .select("*")
            .eq("id", id)
            .eq("uploaded_by", user.id)
            .single()
    },

    async create(documentData: DocumentInsert) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error("Unauthorized") }

        return await supabase
            .from("documents")
            .insert({ ...documentData, uploaded_by: user.id })
            .select()
            .single()
    },

    async delete(id: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: new Error("Unauthorized") }

        return await supabase
            .from("documents")
            .delete()
            .eq("id", id)
            .eq("uploaded_by", user.id)
    },

    async uploadFile(file: File, caseId: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Unauthorized")

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${caseId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { data, error } = await supabase.storage
            .from('case-documents')
            .upload(fileName, file)

        return { data, error, fileName }
    },

    async deleteFile(filePath: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Unauthorized")

        // Ensure user can only delete from their own path
        if (!filePath.startsWith(`${user.id}/`)) {
            throw new Error("Unauthorized to delete this file")
        }

        return await supabase.storage
            .from('case-documents')
            .remove([filePath])
    },

    async getFileUrl(filePath: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Unauthorized")

        // In a real app, you'd check permissions before getting a public URL if private
        const { data } = supabase.storage
            .from('case-documents')
            .getPublicUrl(filePath)

        return data.publicUrl
    },

    async downloadFile(filePath: string) {
        return await supabase.storage
            .from('case-documents')
            .download(filePath)
    }
}
