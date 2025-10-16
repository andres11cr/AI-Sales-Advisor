"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"
import { data } from "@/lib/nav-data"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils" // if you have it; otherwise inline class join

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="hidden border-r md:block">
        <div className="flex h-full flex-col">
          {/* Brand / User */}
          <div className="flex items-center gap-3 p-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={data.user.avatar} alt={data.user.name} />
              <AvatarFallback>{data.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium leading-none">{data.user.name}</div>
              <div className="text-xs text-muted-foreground">{data.user.email}</div>
            </div>
          </div>
          <Separator />

          {/* Main nav */}
          <ScrollArea className="flex-1">
            <nav className="p-2">
              {data.navMain.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                    pathname === item.url ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>

            <Separator className="my-2" />

            {/* Secondary nav */}
            <nav className="p-2">
              {data.navSecondary.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>

            {/* Documents shortcuts */}
            <Separator className="my-2" />
            <div className="p-2">
              <div className="px-3 pb-2 text-xs font-medium uppercase text-muted-foreground">Documents</div>
              <div className="space-y-1">
                {data.documents.map((d) => (
                  <Link
                    key={d.name}
                    href={d.url}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <d.icon className="h-4 w-4" />
                    <span>{d.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col">
        {/* Topbar (you can add search, actions, etc.) */}
        <header className="flex h-14 items-center gap-4 border-b px-4">
          <div className="text-sm text-muted-foreground">AI Sales Advisor</div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
