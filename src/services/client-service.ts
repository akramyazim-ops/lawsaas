import { supabase } from "@/lib/supabase"
import { Client, ClientInsert, ClientUpdate } from "@/types/client"

export const ClientService = {
    async getAll() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: new Error("Unauthorized") }

        return await supabase
            .from("clients")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
    },

    async getById(id: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error("Unauthorized") }

        return await supabase
            .from("clients")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single()
    },

    async create(client: ClientInsert) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error("Unauthorized") }

        return await supabase
            .from("clients")
            .insert({ ...client, user_id: user.id })
            .select()
            .single()
    },

    async update(id: string, client: ClientUpdate) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error("Unauthorized") }

        return await supabase
            .from("clients")
            .update(client)
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single()
    },

    async delete(id: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: new Error("Unauthorized") }

        return await supabase
            .from("clients")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id)
    }
}
