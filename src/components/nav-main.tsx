"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface NavMenuItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  onClick?: (e: React.MouseEvent) => void
  items?: {
    title: string
    url: string
    onClick?: (e: React.MouseEvent) => void
  }[]
}

export function NavMain({
  items,
}: {
  items: NavMenuItem[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                {item.onClick ? (
                  <Link href={item.url} onClick={item.onClick} className="flex h-9 w-full items-center gap-2 rounded-md px-3 hover:bg-sidebar-hover">
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                ) : (
                  <Link href={item.url} className="flex h-9 w-full items-center gap-2 rounded-md px-3 hover:bg-sidebar-hover">
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                )}
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            {subItem.onClick ? (
                              <Link href={subItem.url} onClick={subItem.onClick} className="flex h-9 w-full items-center gap-2 rounded-md px-3 pl-10 hover:bg-sidebar-hover">
                                <span>{subItem.title}</span>
                              </Link>
                            ) : (
                              <Link href={subItem.url} className="flex h-9 w-full items-center gap-2 rounded-md px-3 pl-10 hover:bg-sidebar-hover">
                                <span>{subItem.title}</span>
                              </Link>
                            )}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
