import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { ThemeScope } from '../../theme';

export const Portal = ({ children }: { children: ReactNode }) => ReactDOM.createPortal(<ThemeScope>{children}</ThemeScope>, document.body);
