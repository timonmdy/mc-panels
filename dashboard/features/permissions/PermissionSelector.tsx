import React from 'react';
import styled from 'styled-components';
import type { ServerGrant } from '../../api/api.types';
import { color } from '../../framework/theme';

const List = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 8px;
    margin: 12px 0;
`;

const Option = styled.label`
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 9px;
    border: 1px solid ${color.border};
    border-radius: 7px;
    color: ${color.text};
    cursor: pointer;

    input {
        margin-top: 3px;
        accent-color: ${color.accent};
    }

    small {
        display: block;
        margin-top: 3px;
        color: ${color.muted};
        font-size: 11px;
    }
`;

export const GRANT_OPTIONS: Array<{ key: ServerGrant; label: string; description: string }> = [
    { key: 'view', label: 'View dashboard', description: 'View panels and live metrics.' },
    { key: 'layouts.edit', label: 'Edit layouts', description: 'Move, add, and remove dashboard panels.' },
    { key: 'profiles.manage', label: 'Manage profiles', description: 'Create, edit, and delete profiles and templates.' },
    { key: 'data.view', label: 'View stored data', description: 'Browse collected metrics and server records.' },
    { key: 'data.manage', label: 'Edit and delete stored data', description: 'Change or permanently remove stored records.' },
    { key: 'ips.view', label: 'View player IP addresses', description: 'Access private player network information.' },
];

interface Props {
    value: ServerGrant[];
    onChange: (permissions: ServerGrant[]) => void;
}

export const PermissionSelector = ({ value, onChange }: Props) => (
    <List>
        {GRANT_OPTIONS.map(({ key, label, description }) => (
            <Option key={key}>
                <input
                    type='checkbox'
                    checked={value.includes(key)}
                    onChange={() => onChange(value.includes(key) ? value.filter((grant) => grant !== key) : [...value, key])}
                />
                <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                </span>
            </Option>
        ))}
    </List>
);
