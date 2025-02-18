
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-[#2A2F3C] group-[.toaster]:text-foreground group-[.toaster]:border-[#3A3F4C] group-[.toaster]:shadow-lg group-[.toaster]:z-[100]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-[var(--primary-color)] group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      position="top-right"
      expand={false}
      richColors
      {...props}
    />
  )
}

export { Toaster }
