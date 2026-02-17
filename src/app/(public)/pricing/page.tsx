"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { SubscriptionService } from "@/services/subscription-service"
import { Profile } from "@/types/profile"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function PricingPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [upgrading, setUpgrading] = useState<string | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) {
                const { data } = await SubscriptionService.getCurrentProfile()
                setProfile(data)
            }
            setLoading(false)
        }
        fetchUser()
    }, [])

    const handleUpgrade = async (plan: 'free' | 'pro' | 'enterprise') => {
        if (!user) {
            router.push(`/register?plan=${plan}`)
            return
        }

        setUpgrading(plan)
        try {
            const { error } = await SubscriptionService.changePlan(plan)
            if (error) throw error
            toast.success(`Successfully upgraded to ${plan} plan!`)
            router.push("/dashboard")
        } catch (error: any) {
            toast.error(error.message || "Failed to upgrade plan")
        } finally {
            setUpgrading(null)
        }
    }

    const tiers = [
        {
            name: "Free",
            id: "tier-free",
            plan: "free" as const,
            priceMonthly: "RM 0",
            description: "Perfect for solo practitioners and students.",
            features: [
                "3 Active Cases",
                "Basic Document Management",
                "Secure Client Portal",
                "Standard Support",
                "5 Clients Maximum",
            ],
            cta: user ? "Switch Plan" : "Get Started",
            popular: false,
        },
        {
            name: "Professional",
            id: "tier-pro",
            plan: "pro" as const,
            priceMonthly: "RM 199",
            description: "Ideal for small firms up to 5 users.",
            features: [
                "50 Active Cases",
                "Advanced Document Search",
                "Priority Support",
                "Client Portal Access",
                "50 Clients Maximum",
            ],
            cta: user ? "Upgrade Now" : "Start Free Trial",
            popular: true,
        },
        {
            name: "Enterprise",
            id: "tier-enterprise",
            plan: "enterprise" as const,
            priceMonthly: "Custom",
            description: "Dedicated support and infrastructure for large firms.",
            features: [
                "Unlimited Everything",
                "Custom Reporting",
                "API Access",
                "Dedicated Account Manager",
                "SLA & Compliance",
            ],
            cta: "Contact Sales",
            popular: false,
        },
    ]

    return (
        <div className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Choose the right plan for your firm
                    </p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground">
                    Scalable solutions for law firms of all sizes. Start free and upgrade as you grow.
                </p>
                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
                    {tiers.map((tier) => (
                        <Card key={tier.id} className={`flex flex-col justify-between relative transition-all duration-300 ${tier.popular ? 'border-primary shadow-lg scale-105 z-10' : 'border-border'}`}>
                            {tier.popular && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                    <Badge className="bg-primary px-3 py-1 text-sm text-primary-foreground">Most Popular</Badge>
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex items-center justify-between gap-x-4">
                                    <CardTitle id={tier.id} className="text-lg font-semibold leading-8 text-foreground">
                                        {tier.name}
                                        {profile?.plan === tier.plan && (
                                            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 border-green-200">Current</Badge>
                                        )}
                                    </CardTitle>
                                </div>
                                <CardDescription className="mt-4 text-sm leading-6 text-muted-foreground">
                                    {tier.description}
                                </CardDescription>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-foreground">{tier.priceMonthly}</span>
                                    <span className="text-sm font-semibold leading-6 text-muted-foreground">{tier.priceMonthly !== "Custom" && "/month"}</span>
                                </p>
                            </CardHeader>
                            <CardContent>
                                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex gap-x-3">
                                            <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                {tier.plan === 'enterprise' ? (
                                    <Button asChild className="w-full" variant="outline">
                                        <Link href="/contact">{tier.cta}</Link>
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleUpgrade(tier.plan)}
                                        className="w-full shadow-md transition-shadow hover:shadow-lg"
                                        variant={tier.popular ? "default" : "outline"}
                                        disabled={loading || upgrading !== null || profile?.plan === tier.plan}
                                    >
                                        {upgrading === tier.plan ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : null}
                                        {profile?.plan === tier.plan ? "Current Plan" : tier.cta}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
