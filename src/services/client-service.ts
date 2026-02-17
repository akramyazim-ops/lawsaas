import { supabase } from "@/lib/supabase"
import { Client, ClientInsert, ClientUpdate } from "@/types/client"

export const ClientService = {
    async getAll() {
        return await supabase
            .from("clients")
            .select("*")
            .order("created_at", { ascending: false })
    },

    async getById(id: string) {
        return await supabase
            .from("clients")
            .select("*")
            .eq("id", id)
            .single()
    },

    async create(client: ClientInsert) {
        return await supabase
            .from("clients")
            .insert(client)
            .select()
            .single()
    },

    async update(id: string, client: ClientUpdate) {
        return await supabase
            .from("clients")
            .update(client)
            .eq("id", id)
            .select()
            .single()
    },

    async delete(id: string) {
        return await supabase
            .from("clients")
            .delete()
            .eq("id", id)
    }
}
