import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    AvatarBadge,
} from "@/components/ui/avatar"
import { initials } from "@/features/profile/utils/initials"
import { cn } from "@/lib/utils"
import { PlayerStatus } from "@bchess/shared"

export default function PlayerAvatar({
    username,
    avatar,
    className,
    status,
}: {
    username: string
    avatar?: string | null
    className?: string
    status?: PlayerStatus | null
}) {
    return (
        <Avatar className={cn("h-10 w-10 shrink-0", className)}>
            <AvatarImage
                src={avatar ?? "/images/default-avatar.jpg"}
                alt={username}
            />
            <AvatarFallback className="text-xs font-medium">
                {initials(username)}
            </AvatarFallback>
            <AvatarBadge
                hidden={!status}
                className={cn({
                    "bg-green-600": status === "connected",
                    "bg-red-600": status === "disconnected",
                })}
            />
        </Avatar>
    )
}
