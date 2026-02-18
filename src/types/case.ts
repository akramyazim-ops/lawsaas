export interface Case {
    id: string
    title: string
    description: string | null
    status: 'open' | 'closed' | 'pending'
    client_id: string | null
    service_type: string | null
    due_date: string | null
    user_id?: string
    created_at: string
    updated_at: string
}

export type CaseInsert = Omit<Case, 'id' | 'created_at' | 'updated_at'>
export type CaseUpdate = Partial<CaseInsert>

export interface CaseWithClient extends Case {
    clients?: {
        id: string
        name: string
        email: string | null
    } | null
}
