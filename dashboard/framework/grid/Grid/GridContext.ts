import { createContext, useContext } from 'react';

export interface GridContextValue {
    columns: number;
    width: number;
}

export const GridContext = createContext<GridContextValue>({ columns: 4, width: 0 });

export const useGrid = (): GridContextValue => useContext(GridContext);
