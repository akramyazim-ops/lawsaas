import { LoginForm } from "@/components/auth/login-form"
import { Suspense } from "react"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
            <Suspense fallback={<div className="text-muted-foreground font-medium">Loading session...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}
