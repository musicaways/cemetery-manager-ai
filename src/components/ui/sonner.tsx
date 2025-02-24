
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
      closeButton={true}
      richColors={true}
      className="toaster group"
      offset={50}
      gap={8}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-[var(--message-bg)] group-[.toaster]:bg-opacity-95 group-[.toaster]:backdrop-blur-sm group-[.toaster]:text-foreground group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:border-none group-[.toaster]:min-h-[60px] group-[.toaster]:max-w-[420px]",
          title: "group-[.toast]:text-white group-[.toast]:font-medium group-[.toast]:text-sm",
          description: "group-[.toast]:text-gray-200 group-[.toast]:text-sm group-[.toast]:leading-relaxed",
          actionButton: "group-[.toast]:bg-[var(--primary-color)] group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:!bg-green-600/90 group-[.toast]:!bg-opacity-95 group-[.toast]:!backdrop-blur-sm group-[.toast]:!text-white group-[.toast]:!rounded-xl",
          error: "group-[.toast]:!bg-red-600/90 group-[.toast]:!bg-opacity-95 group-[.toast]:!backdrop-blur-sm group-[.toast]:!text-white group-[.toast]:!rounded-xl",
          info: "group-[.toast]:!bg-blue-600/90 group-[.toast]:!bg-opacity-95 group-[.toast]:!backdrop-blur-sm group-[.toast]:!text-white group-[.toast]:!rounded-xl",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
