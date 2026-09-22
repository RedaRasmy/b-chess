'use client';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface TextFieldProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    placeholder?: string;
    icon?: LucideIcon;
    type?: React.HTMLInputTypeAttribute;
    className?: string;
    inputClassName?: string;
    endAdornment?: React.ReactNode;
    disabled?: boolean;
}

export function TextField<T extends FieldValues>({
    name,
    control,
    label,
    placeholder,
    icon: Icon,
    type = 'text',
    className,
    inputClassName,
    endAdornment,
    disabled,
}: TextFieldProps<T>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className={className}>
                    {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}

                    <div className="relative">
                        {Icon && (
                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        )}
                        <Input
                            {...field}
                            id={name}
                            aria-invalid={fieldState.invalid}
                            type={type}
                            placeholder={placeholder}
                            disabled={disabled}
                            className={cn(Icon && 'pl-10', endAdornment && 'pr-10', inputClassName)}
                        />
                        {endAdornment}
                    </div>

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    );
}
