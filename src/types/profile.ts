export interface Profile {
    id: string
    full_name: string | null
    plan: 'starter' | 'growth' | 'pro_firm' | 'free'
    subscription_status: 'active' | 'past_due' | 'canceled' | 'incomplete'
    created_at: string
    updated_at: string
}

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
