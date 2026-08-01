import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initials } from "@/features/profile/utils/initials"
import { cn } from "@/lib/utils"

export default function PlayerAvatar({
    username,
    avatar,
    className,
}: {
    username: string
    avatar?: string | null
    className?: string
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
        </Avatar>
    )
}
