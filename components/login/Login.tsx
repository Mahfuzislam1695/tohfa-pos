"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Define validation schema
const formSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
})

type FormData = z.infer<typeof formSchema>

export default function Login() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const { mutate: login, isPending } = useAuth(() => {
        router.push("/dashboard");
    })

    const onSubmit = (data: FormData) => {
        login(data)
    }

    const isProcessing = isPending || isSubmitting

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                            <ShoppingCart className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">POS System</h1>
                    </div>
                    <p className="text-muted-foreground text-center">Welcome back! Sign in to manage your shop</p>
                </div>

                <Card className="shadow-xl border-border/50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
                        <CardDescription>Enter your credentials to access your account</CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    {...register("email")}
                                    disabled={isProcessing}
                                    className="h-11"
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <a
                                        href="/forgot-password"
                                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        {...register("password")}
                                        disabled={isProcessing}
                                        className="h-11 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        disabled={isProcessing}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-500">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Display form-level errors if any */}
                            {errors.root && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                    <p className="text-sm text-destructive">{errors.root.message}</p>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4">
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-medium"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Signing In...
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </Button>

                            <p className="text-sm text-center text-muted-foreground">
                                Don't have an account?{" "}
                                <a
                                    href="/contact"
                                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                                >
                                    Contact administrator
                                </a>
                            </p>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    By signing in, you agree to our{" "}
                    <a
                        href="/terms"
                        className="underline hover:text-foreground transition-colors"
                    >
                        Terms of Service
                    </a>
                    {" and "}
                    <a
                        href="/privacy"
                        className="underline hover:text-foreground transition-colors"
                    >
                        Privacy Policy
                    </a>
                </p>
            </div>
        </div>
    )
}
