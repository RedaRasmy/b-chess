import { cn } from "@/lib/utils"
import { parseTimerOption, TIMER_OPTIONS, TimerOption } from "@bchess/shared"
import { Clock, Coffee, Zap } from "lucide-react"

type Props = (
    | {
          value: TimerOption | null
          onChange: (option: TimerOption | null) => void
          required?: false
      }
    | {
          value: TimerOption
          onChange: (option: TimerOption) => void
          required: true
      }
) & {
    className?: string
    disabled?: boolean
}

export default function SelectTimer({
    value,
    onChange,
    required = false,
    className,
    disabled = false,
}: Props) {
    const options = [...TIMER_OPTIONS]

    function handleClick(op: TimerOption) {
        if (disabled) return
        if (required) {
            onChange(op)
        } else {
            if (value === op) {
                // set to null if same option clicked twice
                ;(onChange as (option: TimerOption | null) => void)(null)
            } else {
                onChange(op)
            }
        }
    }
    return (
        <div
            className={cn(
                "grid grid-cols-3 grid-rows-3 gap-2 lg:gap-4 ",
                className,
                {},
            )}
        >
            {options.map((op, i) => {
                const { base, plus, type } = parseTimerOption(op)
                const Icon =
                    type === "bullet" ? Zap : type === "blitz" ? Clock : Coffee
                return (
                    <div
                        key={i}
                        className={cn(
                            "rounded-lg px-10 md:px-15 lg:px-10 border-2 border-accent/50 cursor-pointer w-full max-w-70 flex items-center gap-1 flex-col  py-2.5 lg:py-6",
                            {
                                "border-primary bg-primary/30": value === op,
                                "bg-muted/50 text-muted-foreground":
                                    disabled && value !== op,
                            },
                        )}
                        onClick={() => handleClick(op)}
                    >
                        <Icon
                            className={cn("not-md:size-5 text-red-500", {
                                "text-red-500/50": disabled && value !== op,
                            })}
                        />
                        <p className="font-semibold md:text-lg">
                            {base / 60}+{plus}
                        </p>
                        <p className="text-muted-foreground">{type}</p>
                    </div>
                )
            })}
        </div>
    )
}
