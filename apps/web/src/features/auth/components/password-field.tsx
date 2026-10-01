'use client';
import Link from 'next/link';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Eye, EyeClosed, Key } from 'lucide-react';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PasswordFieldProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    placeholder?: string;
    forgotPasswordHref?: string;
    disabled?: boolean;
}

export function PasswordField<T extends FieldValues>({
    name,
    control,
    label = 'Password',
    placeholder = 'Enter your password',
    forgotPasswordHref,
    disabled,
}: PasswordFieldProps<T>) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>

                    <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            {...field}
                            id={name}
                            aria-invalid={fieldState.invalid}
                            type={showPassword ? 'text' : 'password'}
                            placeholder={placeholder}
                            disabled={disabled}
                            className="pl-10 pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword((v) => !v)}
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeClosed className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <div className="flex">
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        {forgotPasswordHref && (
                            <Button asChild variant="link" className="ml-auto -mt-2 -mb-4">
                                <Link href={forgotPasswordHref}>forgot password?</Link>
                            </Button>
                        )}
                    </div>
                </Field>
            )}
        />
    );
}
