import { ColorOption } from "@/features/bot/types"
import ChessPieceImage from "@/features/game/components/chess-piece-image"
import { getColor } from "@/features/game/utils/get-color"
import { cn } from "@/lib/utils"

type Props = {
    value: ColorOption
    onChange: (option: ColorOption) => void
    className?: string
}

export default function SelectColor({ value, onChange, className }: Props) {
    const options: ColorOption[] = ["white", "black", "random"]

    return (
        <div
            className={cn(
                "flex gap-2 lg:gap-4 flex-wrap justify-center",
                className,
            )}
        >
            {options.map((op, i) => (
                <div
                    key={i}
                    className={cn(
                        "rounded-lg hover:bg-accent/5 border-2 border-accent/40 cursor-pointer w-full flex items-center justify-center gap-1 lg:gap-3 flex-col ",
                        {
                            "border-primary ": value === op,
                        },
                        "aspect-square  lg:max-w-30 max-w-20",
                    )}
                    onClick={() => onChange(op)}
                >
                    {op === "random" ? (
                        <div className="flex -space-x-5">
                            <ChessPieceImage
                                piece={{ color: "w", type: "k" }}
                                size={50}
                            />{" "}
                            <ChessPieceImage
                                piece={{ color: "b", type: "k" }}
                                size={50}
                            />
                        </div>
                    ) : (
                        <ChessPieceImage
                            piece={{ color: getColor(op), type: "k" }}
                            size={50}
                        />
                    )}

                    <p className="capitalize font-semibold lg:text-xl">{op}</p>
                </div>
            ))}
        </div>
    )
}
