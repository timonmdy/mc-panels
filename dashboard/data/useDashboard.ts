import { useContext } from 'react';
import { DashboardContext, DashboardContextValue } from './DashboardContext';

export const useDashboard = (): DashboardContextValue => {
    const value = useContext(DashboardContext);
    if (!value) throw new Error('useDashboard must be used inside a DashboardContext provider');

    return value;
};
