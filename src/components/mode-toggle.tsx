"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Moon, Sun, Palette, Code, Framer } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only render specific theme components after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle theme change with proper DOM updates
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    // Force a re-render to ensure the UI updates
    document.documentElement.classList.remove('light', 'dark', 'dracula', 'nord', 'monokai')
    document.documentElement.classList.add(newTheme === 'system' ? (resolvedTheme || 'light') : newTheme)
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <Palette className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem]" />}
          {theme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem] text-blue-400" />}
          {theme === "dracula" && <Code className="h-[1.2rem] w-[1.2rem] text-pink-500" />}
          {theme === "nord" && <Framer className="h-[1.2rem] w-[1.2rem] text-blue-400" />}
          {theme === "monokai" && <Code className="h-[1.2rem] w-[1.2rem] text-yellow-500" />}
          {(!theme || theme === "system") && <Palette className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>GitHub Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dracula")}>
          <Code className="mr-2 h-4 w-4 text-pink-500" />
          <span>Dracula</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("nord")}>
          <Framer className="mr-2 h-4 w-4 text-blue-400" />
          <span>Nord</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("monokai")}>
          <Code className="mr-2 h-4 w-4 text-yellow-500" />
          <span>Monokai</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          <Palette className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
