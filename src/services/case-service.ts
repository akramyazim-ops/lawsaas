import { supabase } from "@/lib/supabase"
import { Case, CaseInsert, CaseUpdate } from "@/types/case"

export const CaseService = {
    async getAll() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: new Error("Unauthorized") }

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
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
    },

    async getByClientId(clientId: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: new Error("Unauthorized") }

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
            .eq("client_id", clientId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
    },

    async getCount() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error("Unauthorized") }

        return await supabase
            .from("cases")
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id)
    },

    async getById(id: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error("Unauthorized") }

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
            .eq("user_id", user.id)
            .single()
    },

    async create(caseData: CaseInsert) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error("Unauthorized") }

        return await supabase
            .from("cases")
            .insert({ ...caseData, user_id: user.id })
            .select()
            .single()
    },

    async update(id: string, caseData: CaseUpdate) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error("Unauthorized") }

        return await supabase
            .from("cases")
            .update(caseData)
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single()
    },

    async delete(id: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: new Error("Unauthorized") }

        return await supabase
            .from("cases")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id)
    }
}
