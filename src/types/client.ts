export interface Client {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    user_id?: string
    created_at: string
    updated_at: string
}

export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'>
export type ClientUpdate = Partial<ClientInsert>
