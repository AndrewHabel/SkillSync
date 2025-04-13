import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Solid buttons with theme-specific styling
        solid: "bg-primary text-primary-foreground hover:bg-primary/90",

        // Destructive buttons (red across themes)
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",

        // Outline buttons
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",

        // Secondary/subtle buttons
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        // Ghost buttons 
        ghost: "hover:bg-accent hover:text-accent-foreground",

        // Link style buttons
        link: "text-primary underline-offset-4 hover:underline",

        // Theme-specific gradients
        gradient: "text-white shadow-sm",
      },
      theme: {
        light: "", // Will be applied via CSS variable combinations
        dark: "",
        dracula: "",
        nord: "",
        monokai: "",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        xs: "h-7 rounded-md px-2 text-xs",
        lg: "h-12 rounded-md px-8",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "default",
    },
    compoundVariants: [
      // Light theme gradient
      {
        variant: "gradient",
        theme: "light",
        className: "bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      },
      // Dark theme gradient
      {
        variant: "gradient",
        theme: "dark",
        className: "bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700",
      },
      // Dracula theme gradient
      {
        variant: "gradient",
        theme: "dracula",
        className: "bg-gradient-to-b from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      },
      // Nord theme gradient
      {
        variant: "gradient",
        theme: "nord",
        className: "bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600",
      },
      // Monokai theme gradient
      {
        variant: "gradient",
        theme: "monokai",
        className: "bg-gradient-to-b from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600",
      },
    ],
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  themeOverride?: "light" | "dark" | "dracula" | "nord" | "monokai" | null
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, themeOverride, asChild = false, ...props }, ref) => {
    const { theme } = useTheme();
    const currentTheme = themeOverride || theme || "light";
    const themeValue = currentTheme === "system" ? "light" : currentTheme;
    
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ 
          variant, 
          size, 
          theme: themeValue as any, 
          className 
        }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
