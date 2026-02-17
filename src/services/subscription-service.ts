import { supabase } from "@/lib/supabase"
import { Profile, ProfileUpdate } from "@/types/profile"

export const SubscriptionService = {
    async getCurrentProfile() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error("Not authenticated") }

        return await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()
    },

    async updateProfile(id: string, profileData: ProfileUpdate) {
        return await supabase
            .from("profiles")
            .update(profileData)
            .eq("id", id)
            .select()
            .single()
    },

    async changePlan(plan: Profile['plan']) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error("Not authenticated") }

        return await SubscriptionService.updateProfile(user.id, { plan })
    },

    getPlanLimits(plan: Profile['plan']) {
        const limits = {
            free: {
                clients: 5,
                cases: 3,
                documents: 20,
                invoices: 5,
                features: ["Basic Client Mgmt", "Basic Case Mgmt", "Email Support"],
            },
            pro: {
                clients: 50,
                cases: 50,
                documents: 500,
                invoices: 100,
                features: ["Advanced Billing", "Document Management", "Priority Support"],
            },
            enterprise: {
                clients: Infinity,
                cases: Infinity,
                documents: Infinity,
                invoices: Infinity,
                features: ["Unlimited Everything", "Custom Branding", "Dedicated Account Manager"],
            }
        }
        return limits[plan]
    }
}
