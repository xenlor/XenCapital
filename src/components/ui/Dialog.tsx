'use client'

import * as React from 'react'
import { X } from 'lucide-react'

// Context for Dialog
type DialogContextType = {
    open: boolean
    setOpen: (open: boolean) => void
}
const DialogContext = React.createContext<DialogContextType | undefined>(undefined)

const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
    // Support controlled and uncontrolled state
    const [internalOpen, setInternalOpen] = React.useState(false)
    const isControlled = open !== undefined
    const currentOpen = isControlled ? open : internalOpen
    const handleOpenChange = (newOpen: boolean) => {
        if (!isControlled) {
            setInternalOpen(newOpen)
        }
        onOpenChange?.(newOpen)
    }

    return (
        <DialogContext.Provider value={{ open: currentOpen!, setOpen: handleOpenChange }}>
            {children}
        </DialogContext.Provider>
    )
}
Dialog.displayName = "Dialog"

const DialogTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, onClick, asChild, ...props }, ref) => {
    const context = React.useContext(DialogContext)

    // If asChild is true, we assume the child is a button-like element and we just clone it 
    // to add the onClick handler.
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
                const childProps = (children as React.ReactElement<any>).props
                childProps.onClick?.(e)
                context?.setOpen(true)
            }
        })
    }

    return (
        <button
            ref={ref}
            onClick={() => context?.setOpen(true)}
            {...props}
        >
            {children}
        </button>
    )
})
DialogTrigger.displayName = "DialogTrigger"

const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(DialogContext)

    if (!context?.open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in-0"
                onClick={() => context.setOpen(false)}
            />
            <div
                ref={ref}
                className={`relative z-50 grid w-full max-w-lg gap-4 border border-white/10 bg-card p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-lg ${className}`}
                {...props}
            >
                {children}
                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    onClick={() => context.setOpen(false)}
                >
                    <X className="h-4 w-4 text-muted" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>
    )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className="flex flex-col space-y-1.5 text-center sm:text-left"
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className="text-lg font-semibold leading-none tracking-tight text-foreground"
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle }
