import React, { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { Icon } from '../Icon/Icon';
import type { IconName } from '../Icon/icons.config';
import { Portal } from '../Portal/Portal';
import { Item, Label, Popover, Separator } from './Menu.styles';

const CloseContext = createContext<() => void>(() => undefined);

export interface TriggerProps {
    ref: React.RefObject<HTMLButtonElement | null>;
    onClick: () => void;
    active: boolean;
}

interface Props {
    renderTrigger: (props: TriggerProps) => ReactNode;
    align?: 'start' | 'end';
    children: ReactNode;
}

export const Menu = ({ renderTrigger, align = 'end', children }: Props) => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    const close = useCallback(() => setPosition(null), []);
    useClickOutside([triggerRef, popoverRef], close, position !== null);

    const toggle = () => {
        if (position) return close();

        const rect = triggerRef.current?.getBoundingClientRect();
        if (rect) setPosition({ top: rect.bottom + 6, left: align === 'end' ? rect.right : rect.left });
    };

    return (
        <>
            {renderTrigger({ ref: triggerRef, onClick: toggle, active: position !== null })}
            {position && (
                <Portal>
                    <Popover ref={popoverRef} $top={position.top} $left={position.left} $align={align} role='menu'>
                        <CloseContext.Provider value={close}>{children}</CloseContext.Provider>
                    </Popover>
                </Portal>
            )}
        </>
    );
};

interface MenuItemProps {
    label: string;
    onSelect: () => void;
    icon?: IconName;
    danger?: boolean;
    active?: boolean;
    disabled?: boolean;
}

export const MenuItem = ({ label, onSelect, icon, danger = false, active = false, disabled }: MenuItemProps) => {
    const close = useContext(CloseContext);

    return (
        <Item
            type='button'
            role='menuitem'
            $danger={danger}
            $active={active}
            disabled={disabled}
            onClick={() => {
                close();
                onSelect();
            }}
        >
            {icon && <Icon name={icon} fixedWidth />}
            <span style={{ flex: 1 }}>{label}</span>
            {active && <Icon name='check' />}
        </Item>
    );
};

export const MenuSeparator = Separator;
export const MenuLabel = Label;
