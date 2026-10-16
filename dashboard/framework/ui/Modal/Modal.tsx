import React, { ReactNode, useEffect } from 'react';
import { IconButton } from '../IconButton/IconButton';
import { Portal } from '../Portal/Portal';
import { Backdrop, Body, Dialog, Footer, Header } from './Modal.styles';

interface Props {
    title: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
    width?: number;
}

export const Modal = ({ title, onClose, children, footer, width = 520 }: Props) => {
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);

        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <Portal>
            <Backdrop onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
                <Dialog $width={width} role='dialog' aria-modal='true' aria-label={title}>
                    <Header>
                        <h2>{title}</h2>
                        <IconButton icon='close' label='Close' onClick={onClose} />
                    </Header>
                    <Body>{children}</Body>
                    {footer && <Footer>{footer}</Footer>}
                </Dialog>
            </Backdrop>
        </Portal>
    );
};
