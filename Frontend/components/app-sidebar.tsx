"use client"

import * as React from "react"
import {
  IconBrain,
  IconChartBar,
  IconDashboard,
  IconPlane,
  IconShoppingBagEdit,
  IconMessageChatbot,
  IconHelp,
  IconBrandMinecraft,
  IconRobotFace,
  IconSearch,
  IconSettings,
  IconBook
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: { name: "Andrés Salas Olsen", email: "asalaso@ucenfotec.ac.cr", avatar: "avatar.png" },
  navMain: [
    { title: "Dashboard", url: "dashboard", icon: IconDashboard },
    { title: "Modelo", url: "model", icon: IconBrandMinecraft },
    { title: "Predicciones", url: "predict", icon: IconChartBar },
    { title: "Asistente de inventario", url: "inventory", icon: IconRobotFace },
  ],
  navSecondary: [
    { title: "Settings", url: "#", icon: IconSettings },
    { title: "Get Help", url: "#", icon: IconHelp },
    { title: "Search", url: "#", icon: IconSearch },
  ],
  documents: [
    { name: "Rutas de importación", url: "#", icon: IconPlane },
    { name: "AI Chat Bot", url: "chatbot", icon: IconMessageChatbot }
  ]
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <IconBrain className="!size-5" />
                <span className="text-base font-semibold">AI Sales Advisor</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
          <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
