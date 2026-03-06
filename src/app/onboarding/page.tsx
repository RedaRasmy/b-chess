"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { UsernameSchema } from "@/features/auth/validation"
import { authClient } from "@/lib/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { User } from "lucide-react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import z from "zod"

const Schema = z.object({ username: UsernameSchema })
type Data = z.infer<typeof Schema>

export default function page() {
    const form = useForm({
        resolver: zodResolver(Schema),
        defaultValues: { username: "" },
    })
    const router = useRouter()

    const mutation = useMutation({
        mutationFn: async ({ username }: Data) => {
            const { data: availability } = await authClient.isUsernameAvailable(
                { username },
            )

            if (!availability?.available) {
                throw new Error(
                    "Username is already taken. Please try another.",
                )
            }
            const { data: result, error } = await authClient.updateUser({
                username,
            })

            if (error) throw error
            return result
        },
        onSuccess: () => router.replace("/profile"),
        onError: (err) => {
            form.setError("username", {
                message: err.message ?? "Semething went wrong",
            })
        },
    })

    async function onSubmit(data: Data) {
        mutation.mutate(data)
    }

    return (
        <div className="w-full h-screen bg-linear-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">
                            Pick your username
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                            noValidate
                        >
                            <Controller
                                name="username"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="username">
                                            Username
                                        </FieldLabel>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input
                                                {...field}
                                                id="username"
                                                type="text"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Enter your username"
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

                            <Button
                                type="submit"
                                className="w-full cursor-pointer mt-3"
                                size="lg"
                                disabled={mutation.isPending}
                            >
                                Continue
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
