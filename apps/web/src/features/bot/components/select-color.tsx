import { ColorOption } from "@/features/bot/types"
import { cn } from "@/lib/utils"

type Props = {
    value: ColorOption
    onChange: (option: ColorOption) => void
    className?: string
}

export default function SelectColor({ value, onChange, className }: Props) {
    const options: ColorOption[] = ["white", "black", "random"]

    return (
        <div className={cn("flex gap-2 lg:gap-4 ", className)}>
            {options.map((op, i) => (
                <div
                    key={i}
                    className={cn(
                        "rounded-lg hover:bg-accent/5 border-2 border-accent/40 cursor-pointer w-full md:min-w-10 lg:min-w-30 max-w-50 flex items-center gap-1 flex-col  py-4 lg:py-6",
                        {
                            "border-primary ": value === op,
                        },
                    )}
                    onClick={() => onChange(op)}
                >
                    <div
                        className={cn(
                            op === "white"
                                ? "bg-white"
                                : op === "black"
                                  ? "bg-gray-950"
                                  : "bg-linear-90 from-white  to-gray-950",
                            "size-8 md:size-10 rounded-full",
                        )}
                    />
                    <p className="capitalize font-semibold lg:text-lg ">{op}</p>
                </div>
            ))}
        </div>
    )
}
