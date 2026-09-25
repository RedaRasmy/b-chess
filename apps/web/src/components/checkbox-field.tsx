import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel, FieldError } from '@/components/ui/field'; // adjust to your actual path
import { cn } from '@/lib/utils';

interface CheckboxFieldProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    className?: string;
    disabled?: boolean;
}

export function CheckboxField<T extends FieldValues>({
    name,
    control,
    label,
    className,
    disabled,
}: CheckboxFieldProps<T>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className={className}>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={name}
                            checked={!!field.value}
                            onCheckedChange={(checked: boolean) => field.onChange(checked === true)}
                            onBlur={field.onBlur}
                            disabled={disabled}
                            aria-invalid={fieldState.invalid}
                        />
                        {label && (
                            <FieldLabel
                                htmlFor={name}
                                className={cn(
                                    'cursor-pointer font-normal',
                                    disabled && 'cursor-not-allowed opacity-70',
                                )}
                            >
                                {label}
                            </FieldLabel>
                        )}
                    </div>

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    );
}
