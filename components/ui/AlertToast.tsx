
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XOctagon,
  X,
} from "lucide-react";

const alertToastVariants = cva(
  "relative w-full max-w-sm overflow-hidden rounded-lg shadow-2xl flex items-start p-4 space-x-4 pointer-events-auto",
  {
    variants: {
      variant: {
        success: "",
        warning: "",
        info: "",
        error: "",
      },
      styleVariant: {
        default: "bg-white border border-zinc-200",
        filled: "",
      },
    },
    compoundVariants: [
      {
        variant: "success",
        styleVariant: "default",
        className: "border-green-100",
      },
      {
        variant: "warning",
        styleVariant: "default",
        className: "border-yellow-100",
      },
      {
        variant: "info",
        styleVariant: "default",
        className: "border-blue-100",
      },
      {
        variant: "error",
        styleVariant: "default",
        className: "border-red-100",
      },
    ],
    defaultVariants: {
      variant: "info",
      styleVariant: "default",
    },
  }
);

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: XOctagon,
};

const iconColorClasses: Record<string, string> = {
  success: "text-green-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
  error: "text-red-500",
};

export interface AlertToastProps
  extends Omit<HTMLMotionProps<"div">, "title">,
    VariantProps<typeof alertToastVariants> {
  title: string;
  description: string;
  onClose: () => void;
}

const AlertToast = React.forwardRef<HTMLDivElement, AlertToastProps>(
  (props, ref) => {
    // Extracting variant and styleVariant from props explicitly
    const { className, title, description, onClose, ...rest } = props;
    
    // Explicitly casting to access VariantProps when destructuring from 'rest' isn't picking them up
    const variant = (props as any).variant || 'info';
    const styleVariant = (props as any).styleVariant || 'default';
    
    const activeVariant = variant;
    const activeStyleVariant = styleVariant;
    const Icon = iconMap[activeVariant as keyof typeof iconMap] || iconMap.info;
    
    return (
      <motion.div
        ref={ref}
        role="alert"
        layout
        initial={{ opacity: 0, x: 50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        className={cn(alertToastVariants({ variant: activeVariant, styleVariant: activeStyleVariant }), className)}
        {...rest}
      >
        <div className="flex-shrink-0">
          <Icon className={cn("h-5 w-5", iconColorClasses[activeVariant as string])} aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{title}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider leading-relaxed">{description}</p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-300 hover:text-black hover:bg-zinc-100 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  }
);

AlertToast.displayName = "AlertToast";
export { AlertToast };
