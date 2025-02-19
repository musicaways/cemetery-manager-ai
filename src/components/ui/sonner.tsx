
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
          toast: "group toast group-[.toaster]:bg-[var(--message-bg)] group-[.toaster]:text-foreground group-[.toaster]:border-[var(--border-color)] group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:z-[100] group-[.toaster]:min-h-[60px] group-[.toaster]:max-w-[420px]",
          title: "group-[.toast]:text-white group-[.toast]:font-medium group-[.toast]:text-sm",
          description: "group-[.toast]:text-gray-200 group-[.toast]:text-sm group-[.toast]:leading-relaxed",
          actionButton: "group-[.toast]:bg-[var(--primary-color)] group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:!bg-green-600/90 group-[.toast]:!text-white group-[.toast]:!border-green-500 group-[.toast]:!rounded-xl",
          error: "group-[.toast]:!bg-red-600/90 group-[.toast]:!text-white group-[.toast]:!border-red-500 group-[.toast]:!rounded-xl",
          info: "group-[.toast]:!bg-blue-600/90 group-[.toast]:!text-white group-[.toast]:!border-blue-500 group-[.toast]:!rounded-xl",
          closeButton: "group-[.toast]:!top-3 group-[.toast]:!right-3",
        },
      }}
      position="top-center"
      expand={false}
      richColors
      closeButton
      visibleToasts={1}
      gap={8}
      offset="6rem"
      duration={4000}
      {...props}
    />
  )
}

export { Toaster }
