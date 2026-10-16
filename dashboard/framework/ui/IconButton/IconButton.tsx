import React, { forwardRef } from 'react';
import { Icon } from '../Icon/Icon';
import type { IconName } from '../Icon/icons.config';
import { Root } from './IconButton.styles';

interface Props extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
    icon: IconName;
    label: string;
    active?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, Props>(({ icon, label, active = false, type = 'button', ...rest }, ref) => (
    <Root ref={ref} $active={active} type={type} aria-label={label} title={label} {...rest}>
        <Icon name={icon} fixedWidth />
    </Root>
));
