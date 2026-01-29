import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      closeButton
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground group-[.toaster]:border-primary group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-primary-foreground/90",
          actionButton: "group-[.toast]:bg-background group-[.toast]:text-primary",
          cancelButton: "group-[.toast]:bg-background/80 group-[.toast]:text-primary",
          closeButton: "group-[.toast]:bg-primary-foreground/20 group-[.toast]:text-primary-foreground group-[.toast]:border-primary-foreground/20 group-[.toast]:hover:bg-primary-foreground/30",
          error: "group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground group-[.toaster]:border-primary",
          success: "group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground group-[.toaster]:border-primary",
          warning: "group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground group-[.toaster]:border-primary",
          info: "group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground group-[.toaster]:border-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
