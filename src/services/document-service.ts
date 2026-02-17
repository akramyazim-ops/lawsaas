import { supabase } from "@/lib/supabase"
import { Document, DocumentInsert, DocumentUpdate } from "@/types/document"

export const DocumentService = {
    async getAll() {
        return await supabase
            .from("documents")
            .select("*")
            .order("created_at", { ascending: false })
    },

    async getByCaseId(caseId: string) {
        return await supabase
            .from("documents")
            .select("*")
            .eq("case_id", caseId)
            .order("created_at", { ascending: false })
    },

    async getById(id: string) {
        return await supabase
            .from("documents")
            .select("*")
            .eq("id", id)
            .single()
    },

    async create(documentData: DocumentInsert) {
        return await supabase
            .from("documents")
            .insert(documentData)
            .select()
            .single()
    },

    async delete(id: string) {
        return await supabase
            .from("documents")
            .delete()
            .eq("id", id)
    },

    async uploadFile(file: File, caseId: string) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${caseId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { data, error } = await supabase.storage
            .from('case-documents')
            .upload(fileName, file)

        return { data, error, fileName }
    },

    async deleteFile(filePath: string) {
        return await supabase.storage
            .from('case-documents')
            .remove([filePath])
    },

    async getFileUrl(filePath: string) {
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
