import React from 'react';
import { EmptyState, Spinner } from '../../../framework/ui';

export const PanelError = ({ message }: { message?: string }) => (
    <EmptyState icon='warning' title="Couldn't load data" hint={message ?? 'Will retry automatically.'} />
);

export const PanelLoading = () => (
    <div style={{ display: 'grid', placeItems: 'center', height: '100%', minHeight: 60 }}>
        <Spinner />
    </div>
);
