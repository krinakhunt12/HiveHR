import * as React from "react";
import { cn } from "@/shared/utils/cn";

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block cursor-pointer" ref={containerRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { isOpen, setIsOpen });
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuTrigger = ({ 
  children, 
  asChild, 
  setIsOpen 
}: { 
  children: React.ReactNode; 
  asChild?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const handleClick = () => setIsOpen?.((prev: boolean) => !prev);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        handleClick();
        (children.props as any).onClick?.(e);
      }
    });
  }

  return <button onClick={handleClick}>{children}</button>;
};

const DropdownMenuContent = ({ 
  children, 
  isOpen, 
  setIsOpen,
  className,
  align = "end"
}: { 
  children: React.ReactNode; 
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  align?: "start" | "end";
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100",
        align === "end" ? "right-0" : "left-0",
        className
      )}
      onClick={() => setIsOpen?.(false)}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({ 
  children, 
  onClick, 
  className,
  disabled 
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <button
      disabled={disabled}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {children}
    </button>
  );
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
