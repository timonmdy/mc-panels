import React, { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { Button } from './Button/Button';
import { Modal } from './Modal/Modal';

interface ConfirmationOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    destructive?: boolean;
}

interface PendingConfirmation extends ConfirmationOptions {
    resolve: (confirmed: boolean) => void;
}

type Confirm = (options: ConfirmationOptions) => Promise<boolean>;

const ConfirmationContext = createContext<Confirm | null>(null);

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
    const [pending, setPending] = useState<PendingConfirmation | null>(null);
    const pendingRef = useRef<PendingConfirmation | null>(null);

    const close = useCallback((confirmed: boolean) => {
        const current = pendingRef.current;
        pendingRef.current = null;
        setPending(null);
        current?.resolve(confirmed);
    }, []);

    const confirm = useCallback<Confirm>((options) => new Promise((resolve) => {
        pendingRef.current?.resolve(false);
        const next = { ...options, resolve };
        pendingRef.current = next;
        setPending(next);
    }), []);

    return (
        <ConfirmationContext.Provider value={confirm}>
            {children}
            {pending && (
                <Modal
                    title={pending.title}
                    onClose={() => close(false)}
                    footer={(
                        <>
                            <Button variant='ghost' onClick={() => close(false)}>Cancel</Button>
                            <Button
                                variant={pending.destructive === false ? 'primary' : 'danger'}
                                icon={pending.destructive === false ? undefined : 'trash'}
                                onClick={() => close(true)}
                            >
                                {pending.confirmLabel ?? 'Delete'}
                            </Button>
                        </>
                    )}
                >
                    <p>{pending.message}</p>
                </Modal>
            )}
        </ConfirmationContext.Provider>
    );
};

export const useConfirmation = (): Confirm => {
    const confirm = useContext(ConfirmationContext);
    if (!confirm) throw new Error('useConfirmation must be used within ConfirmationProvider');

    return confirm;
};
