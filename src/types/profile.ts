export interface Profile {
    id: string
    full_name: string | null
    plan: 'free' | 'pro' | 'enterprise'
    subscription_status: 'active' | 'past_due' | 'canceled' | 'incomplete'
    created_at: string
    updated_at: string
}

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
