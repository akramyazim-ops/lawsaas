import { supabase } from "@/lib/supabase"
import { Case, CaseInsert, CaseUpdate } from "@/types/case"

export const CaseService = {
    async getAll() {
        return await supabase
            .from("cases")
            .select(`
        *,
        clients (
          id,
          name,
          email
        )
      `)
            .order("created_at", { ascending: false })
    },

    async getCount() {
        return await supabase
            .from("cases")
            .select('*', { count: 'exact', head: true })
    },

    async getById(id: string) {
        return await supabase
            .from("cases")
            .select(`
        *,
        clients (
          id,
          name,
          email
        )
      `)
            .eq("id", id)
            .single()
    },

    async create(caseData: CaseInsert) {
        return await supabase
            .from("cases")
            .insert(caseData)
            .select()
            .single()
    },

    async update(id: string, caseData: CaseUpdate) {
        return await supabase
            .from("cases")
            .update(caseData)
            .eq("id", id)
            .select()
            .single()
    },

    async delete(id: string) {
        return await supabase
            .from("cases")
            .delete()
            .eq("id", id)
    }
}
