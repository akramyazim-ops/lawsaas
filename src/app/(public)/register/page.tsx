import { RegisterForm } from "@/components/auth/register-form"
import { Suspense } from "react"

export default function RegisterPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Suspense fallback={<div>Loading...</div>}>
                <RegisterForm />
            </Suspense>
        </div>
    )
}
