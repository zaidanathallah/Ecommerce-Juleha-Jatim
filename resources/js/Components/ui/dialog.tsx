import * as React from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    return (
        <Transition show={open} as={React.Fragment}>
            <HeadlessDialog as="div" className="relative z-50" onClose={() => onOpenChange(false)}>
                {/* Backdrop: high contrast, anti-slop solid opacity */}
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-100"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-75"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-none transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-100"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-75"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <div className="w-full sm:max-w-lg my-8 transform text-left align-middle transition-all">
                                {children}
                            </div>
                        </Transition.Child>
                    </div>
                </div>
            </HeadlessDialog>
        </Transition>
    );
}

export function DialogContent({
    className,
    children,
    onClose,
}: {
    className?: string;
    children: React.ReactNode;
    onClose?: () => void;
}) {
    return (
        <HeadlessDialog.Panel
            className={cn(
                'relative border-2 border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xl rounded-lg overflow-hidden',
                className
            )}
        >
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 focus:outline-none"
                >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Tutup</span>
                </button>
            )}
            {children}
        </HeadlessDialog.Panel>
    );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('flex flex-col space-y-1.5 text-center sm:text-left mb-4', className)}
            {...props}
        />
    );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 gap-2', className)}
            {...props}
        />
    );
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2
            className={cn('text-lg font-black leading-none tracking-tight text-neutral-950 dark:text-white', className)}
            {...props}
        />
    );
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn('text-xs text-neutral-500 dark:text-neutral-400', className)}
            {...props}
        />
    );
}
