"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useMutation } from "@tanstack/react-query"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Eye, EyeClosed, Key, Mail } from "lucide-react"
import {
    EmailSchema,
    LoginCredentials,
    LoginSchema,
} from "@/features/auth/validation"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import GoogleButton from "@/features/auth/components/google-button"
import GithubButton from "@/features/auth/components/github-button"

export default function LoginPage() {
    const form = useForm({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            emailOrUsername: "",
            password: "",
        },
    })
    const params = useSearchParams()
    const error = params.get("error")

    const router = useRouter()

    const mutation = useMutation({
        mutationFn: async (data: LoginCredentials) => {
            const isEmail = EmailSchema.safeParse(data.emailOrUsername).success

            if (isEmail) {
                const { data: result, error } = await authClient.signIn.email({
                    email: data.emailOrUsername,
                    password: data.password,
                })
                if (error) throw error
                return result
            } else {
                const { data: result, error } =
                    await authClient.signIn.username({
                        username: data.emailOrUsername,
                        password: data.password,
                    })
                if (error) throw error
                return result
            }
        },
        onSuccess: async () => {
            router.replace("/profile")
        },
        onError: (err) => {
            const message =
                err.message || "Something went wrong , Please try again."
            form.setError("root", {
                message,
            })
        },
    })

    async function onSubmit(data: LoginCredentials) {
        mutation.mutate(data)
    }

    const errors = form.formState.errors
    const message = errors.root?.message ?? error ?? null

    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back to Home */}
                <Link href="/">
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>

                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">
                            Welcome Back
                        </CardTitle>
                        <CardDescription>
                            Sign in to your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                            noValidate
                        >
                            <p className="text-red-500">{message}</p>
                            {/* Email Field */}
                            <Controller
                                name="emailOrUsername"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="email">
                                            Identifier
                                        </FieldLabel>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input
                                                {...field}
                                                id="email"
                                                type="email"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Enter your email or username"
                                                className="pl-10"
                                            />
                                        </div>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />

                            {/* Password Field */}
                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="password">
                                            Password
                                        </FieldLabel>

                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input
                                                {...field}
                                                id="password"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="Enter your password"
                                                className="pl-10 pr-10"
                                            />

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                            >
                                                {showPassword ? (
                                                    <EyeClosed className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />

                            {/* Sign In Button */}
                            <Button
                                type="submit"
                                className="w-full cursor-pointer mt-3"
                                size="lg"
                                disabled={mutation.isPending}
                            >
                                Sign in
                            </Button>
                        </form>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Or sign in with
                                </span>
                            </div>
                        </div>

                        {/* OAuth Login */}
                        <div className="grid grid-cols-2 gap-4">
                            <GoogleButton />
                            <GithubButton />
                        </div>

                        {/* Sign Up Link */}
                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">
                                Don't have an account?
                            </span>
                            <Link href="/auth/register">
                                <Button variant={"link"}>Sign up</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
