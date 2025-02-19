
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group fixed"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-[#2A2F3C] group-[.toaster]:text-foreground group-[.toaster]:border-[#3A3F4C] group-[.toaster]:shadow-2xl group-[.toaster]:shadow-black/20 group-[.toaster]:rounded-xl group-[.toaster]:z-[100] group-[.toaster]:min-h-[60px] group-[.toaster]:max-w-[420px] group-[.toaster]:mt-16",
          title: "group-[.toast]:text-white group-[.toast]:font-medium group-[.toast]:text-sm",
          description: "group-[.toast]:text-gray-200 group-[.toast]:text-sm group-[.toast]:leading-relaxed",
          actionButton: "group-[.toast]:bg-[var(--primary-color)] group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "!bg-green-600/90 !text-white !border-green-500 !rounded-xl",
          error: "!bg-red-600/90 !text-white !border-red-500 !rounded-xl",
          info: "!bg-blue-600/90 !text-white !border-blue-500 !rounded-xl",
        },
      }}
      position="top-center"
      expand={false}
      richColors
      closeButton
      visibleToasts={1}
      gap={8}
      offset="1.5rem"
      duration={4000}
      {...props}
    />
  )
}

export { Toaster }
