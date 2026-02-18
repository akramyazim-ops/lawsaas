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
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

function PricingContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [upgrading, setUpgrading] = useState<string | null>(null)
    const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')

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

    useEffect(() => {
        const autoUpgradePlan = searchParams.get('plan') as 'starter' | 'growth' | 'pro_firm' | 'free' | null
        if (autoUpgradePlan && autoUpgradePlan !== 'free' && user && profile && !loading && !upgrading && profile.plan === 'free') {
            // Remove plan from URL so it doesn't trigger again
            const newUrl = window.location.pathname
            window.history.replaceState({}, '', newUrl)
            handleUpgrade(autoUpgradePlan)
        }
    }, [user, profile, loading, searchParams])

    const handleUpgrade = async (plan: 'starter' | 'growth' | 'pro_firm' | 'free') => {
        if (profile?.plan === plan) {
            toast.info("You are already on this plan")
            return
        }

        setUpgrading(plan)
        try {
            // Create Checkout Session for all plans as requested
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan,
                    userId: user?.id,
                    userEmail: user?.email,
                    interval: billingInterval,
                }),
            })

            const { url, error: apiError } = await response.json()
            if (apiError) throw new Error(apiError)

            if (url) {
                window.location.href = url
            }
        } catch (error: any) {
            console.error("Upgrade error:", error)
            toast.error(error.message || "Failed to initiate upgrade")
        } finally {
            setUpgrading(null)
        }
    }

    const tiers = [
        {
            name: "Starter",
            id: "tier-starter",
            plan: "starter" as const,
            priceMonthly: "RM 199",
            description: "Best for: Solo lawyers & small firms (1–2 lawyers)",
            features: [
                "Client & matter management",
                "Basic document automation (templates included)",
                "1,000 documents/month",
                "Basic client portal",
                "Task & deadline reminders",
                "Email support",
                "Secure cloud storage (limited)",
            ],
            cta: user ? "Upgrade Now" : "Start Free Trial",
            popular: false,
            positioning: "Digitise your firm at the cost of 1 billable hour.",
        },
        {
            name: "Growth",
            id: "tier-growth",
            plan: "growth" as const,
            priceMonthly: "RM 599",
            description: "Best for: Firms with 3–10 lawyers",
            features: [
                "Includes Starter features, plus:",
                "Unlimited document automation",
                "Custom template builder",
                "Time tracking & billing dashboard",
                "Client portal with e-signature",
                "Workflow automation",
                "5 user accounts included",
                "Priority support",
            ],
            cta: user ? "Upgrade Now" : "Start Free Trial",
            popular: true,
            positioning: "Automate admin. Focus on billable work.",
        },
        {
            name: "Pro Firm",
            id: "tier-pro-firm",
            plan: "pro_firm" as const,
            priceMonthly: "RM 1,499",
            description: "Best for: Established firms & multi-team practices",
            features: [
                "Includes Growth features, plus:",
                "Unlimited users",
                "Advanced analytics & reporting",
                "Role-based permissions",
                "API & accounting integration (e.g., Xero)",
                "Custom onboarding & training",
                "Dedicated account support",
                "Advanced security & audit trail",
            ],
            cta: user ? "Upgrade Now" : "Start Free Trial",
            popular: false,
            positioning: "Run your firm like a modern legal enterprise.",
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
                    <p className="mt-4 text-primary font-black uppercase tracking-[0.2em] text-sm italic">
                        All plans include a 14-day free trial
                    </p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground">
                    Scalable solutions for law firms of all sizes. Start free and upgrade as you grow.
                </p>

                {/* Billing Toggle */}
                <div className="mt-12 flex justify-center items-center gap-4">
                    <span className={`text-sm font-bold ${billingInterval === 'month' ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
                    <button
                        onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
                        className="relative w-14 h-7 bg-muted rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <div className={`w-5 h-5 bg-primary rounded-full shadow-sm transition-transform duration-300 ${billingInterval === 'year' ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${billingInterval === 'year' ? 'text-foreground' : 'text-muted-foreground'}`}>Annually</span>
                        <Badge variant="outline" className="bg-green-100/50 text-green-700 border-green-200 text-[10px] py-0 px-2 font-bold animate-pulse">2 MONTHS FREE</Badge>
                    </div>
                </div>
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
                                <div className="mt-4 p-3 bg-primary/5 border border-primary/10 italic text-[11px] font-medium text-primary leading-tight">
                                    “{tier.positioning}”
                                </div>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-foreground">
                                        RM {billingInterval === 'year'
                                            ? (parseInt(tier.priceMonthly.replace('RM ', '').replace(',', '')) * 10).toLocaleString()
                                            : tier.priceMonthly.replace('RM ', '')}
                                    </span>
                                    <span className="text-sm font-semibold leading-6 text-muted-foreground">/{billingInterval === 'year' ? 'year' : 'month'}</span>
                                </p>
                                {billingInterval === 'year' && (
                                    <p className="text-[10px] text-green-600 font-bold mt-1">Equivalent to RM {(parseInt(tier.priceMonthly.replace('RM ', '').replace(',', '')) * 10 / 12).toFixed(2)}/month</p>
                                )}
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
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function PricingPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <PricingContent />
        </Suspense>
    )
}
