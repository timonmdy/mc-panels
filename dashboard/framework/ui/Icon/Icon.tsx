import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName, ICONS } from './icons.config';

interface Props {
    name: IconName;
    spin?: boolean;
    fixedWidth?: boolean;
    className?: string;
}

export const Icon = ({ name, ...rest }: Props) => <FontAwesomeIcon icon={ICONS[name]} {...rest} />;
