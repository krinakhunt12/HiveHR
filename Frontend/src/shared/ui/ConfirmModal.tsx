import { Dialog } from "./dialog"
import { Button } from "./button"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/shared/utils/cn"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  isLoading = false
}: ConfirmModalProps) {
  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      title={title}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-5">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
            variant === "destructive" ? "bg-red-50 text-red-600" : "bg-primary/5 text-primary"
          )}>
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium leading-relaxed text-textSecondary pt-1">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-row gap-3 pt-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
            loading={isLoading}
            className={cn(
              "flex-1 sm:flex-none  font-semibold transition-all",
              variant === "destructive" ? "bg-red-600 hover:bg-red-700 shadow-red-200" : ""
            )}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
