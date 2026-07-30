import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/app/providers"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import Header from "@/components/header"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "BChess",
    description: "",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Providers>
                    <SidebarProvider>
                        <AppSidebar />
                        <div className="w-full grid grid-rows-[auto_1fr] h-screen">
                            <Header />
                            <main className="md:px-5 lg:px-7 h-full overflow-auto my-auto px-2">
                                {children}
                            </main>
                        </div>
                    </SidebarProvider>
                </Providers>
                <Toaster />
            </body>
        </html>
    )
}
