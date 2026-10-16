import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeScope } from '../../theme';

export const Portal: React.FC = ({ children }) => ReactDOM.createPortal(<ThemeScope>{children}</ThemeScope>, document.body);
