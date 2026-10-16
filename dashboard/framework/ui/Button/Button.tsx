import React, { forwardRef } from 'react';
import { Icon } from '../Icon/Icon';
import type { IconName } from '../Icon/icons.config';
import { ButtonSize, ButtonVariant, Root } from './Button.styles';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: IconName;
    loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(
    ({ variant = 'secondary', size = 'md', icon, loading, children, disabled, type = 'button', ...rest }, ref) => (
        <Root ref={ref} $variant={variant} $size={size} type={type} disabled={disabled || loading} {...rest}>
            {(icon || loading) && <Icon name={loading ? 'refresh' : (icon as IconName)} spin={loading} fixedWidth />}
            {children}
        </Root>
    )
);
