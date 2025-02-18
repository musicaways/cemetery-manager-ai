
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
          toast: "group toast group-[.toaster]:bg-[#2A2F3C] group-[.toaster]:text-foreground group-[.toaster]:border-[#3A3F4C] group-[.toaster]:shadow-2xl group-[.toaster]:shadow-black/20 group-[.toaster]:z-[100]",
          title: "group-[.toast]:text-white group-[.toast]:font-semibold",
          description: "group-[.toast]:text-gray-200",
          actionButton: "group-[.toast]:bg-[var(--primary-color)] group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "!bg-green-600/90 !text-white !border-green-500",
          error: "!bg-red-600/90 !text-white !border-red-500",
          info: "!bg-blue-600/90 !text-white !border-blue-500",
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
