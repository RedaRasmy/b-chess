"use client"
import { Users, Bot, User, Settings } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

const items = [
    { title: "Profile", path: "/profile", icon: User },
    { title: "Multiplayer", path: "/multiplayer", icon: Users },
    { title: "Bot", path: "/bot", icon: Bot },
    //   { title: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { title: "Settings", path: "/settings", icon: Settings },
]

export function AppSidebar() {
    const { state, setOpenMobile } = useSidebar()
    const pathname = usePathname()
    const isCollapsed = state === "collapsed"

    return (
        <Sidebar
            className={cn(isCollapsed ? "w-14" : "w-64")}
            collapsible="icon"
        >
            <SidebarContent>
                <div className="p-4 border-b border-sidebar-border ">
                    <Link
                        onClick={() => setOpenMobile(false)}
                        href="/"
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <div className="size-9 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <Image
                                src="/images/red-rook.png"
                                alt="bloody-chess"
                                width={100}
                                height={100}
                            />
                        </div>
                        {!isCollapsed && (
                            <div>
                                <h1 className="font-bold text-lg text-sidebar-foreground">
                                    BChess
                                </h1>
                                <p className="text-xs text-sidebar-foreground/70">
                                    Play & Improve
                                </p>
                            </div>
                        )}
                    </Link>
                </div>

                <SidebarMenu className="flex p-2 py-3">
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === item.path}
                            >
                                <Link
                                    onClick={() => setOpenMobile(false)}
                                    href={item.path}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {!isCollapsed && <span>{item.title}</span>}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter></SidebarFooter>
        </Sidebar>
    )
}
