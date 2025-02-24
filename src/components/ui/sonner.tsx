
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      expand={false}
      closeButton={false}
      richColors={true}
      className="toaster group"
      offset={50}
      gap={8}
      duration={4000}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-[var(--message-bg)] group-[.toaster]:bg-opacity-95 group-[.toaster]:backdrop-blur-sm group-[.toaster]:text-foreground group-[.toaster]:shadow-lg group-[.toaster]:rounded-md group-[.toaster]:border-2 group-[.toaster]:border-white/10 group-[.toaster]:min-h-[48px] group-[.toaster]:max-w-[420px] group-[.toaster]:px-6 group-[.toaster]:py-3",
          title: "group-[.toast]:text-white group-[.toast]:font-medium group-[.toast]:text-sm",
          description: "group-[.toast]:text-gray-200 group-[.toast]:text-sm group-[.toast]:leading-relaxed",
          actionButton: "group-[.toast]:bg-[var(--primary-color)] group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:!bg-green-600/90 group-[.toast]:!bg-opacity-95 group-[.toast]:!backdrop-blur-sm group-[.toast]:!text-white group-[.toast]:!border-green-400/20",
          error: "group-[.toast]:!bg-red-600/90 group-[.toast]:!bg-opacity-95 group-[.toast]:!backdrop-blur-sm group-[.toast]:!text-white group-[.toast]:!border-red-400/20",
          info: "group-[.toast]:!bg-blue-600/90 group-[.toast]:!bg-opacity-95 group-[.toast]:!backdrop-blur-sm group-[.toast]:!text-white group-[.toast]:!border-blue-400/20",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
