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
                name: "Free Trial",
                features: [
                    "Basic Client Management",
                    "Basic Case Tracking",
                    "Limited Document Storage",
                    "Community Support"
                ],
            },
            starter: {
                clients: 10,
                cases: 10,
                documents: 1000,
                invoices: 50,
                name: "Starter",
                features: [
                    "Client & matter management",
                    "Basic document automation",
                    "1,000 documents/month",
                    "Basic client portal",
                    "Task & deadline reminders",
                    "Email support",
                    "Secure cloud storage (limited)"
                ],
            },
            growth: {
                clients: 50,
                cases: 100,
                documents: Infinity,
                invoices: Infinity,
                name: "Growth",
                features: [
                    "Everything in Starter, plus:",
                    "Unlimited document automation",
                    "Custom template builder",
                    "Time tracking & billing dashboard",
                    "Client portal with e-signature",
                    "Workflow automation",
                    "5 user accounts included",
                    "Priority support"
                ],
            },
            pro_firm: {
                clients: Infinity,
                cases: Infinity,
                documents: Infinity,
                invoices: Infinity,
                name: "Pro Firm",
                features: [
                    "Everything in Growth, plus:",
                    "Unlimited users",
                    "Advanced analytics & reporting",
                    "Role-based permissions",
                    "API & accounting integration",
                    "Custom onboarding & training",
                    "Dedicated account support",
                    "Advanced security & audit trail"
                ],
            }
        }
        return (limits[plan as keyof typeof limits] || limits.free) as {
            clients: number;
            cases: number;
            documents: number;
            invoices: number;
            name: string;
            features: string[];
        }
    }
}
