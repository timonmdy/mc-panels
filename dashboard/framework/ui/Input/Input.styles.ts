import { css } from 'styled-components';
import { color, radius } from '../../theme';

export const controlStyles = css`
    width: 100%;
    padding: 8px 10px;
    background: ${color.bg};
    border: 1px solid ${color.border};
    border-radius: ${radius.sm};
    color: ${color.text};
    font: inherit;
    font-size: 13px;

    &::placeholder {
        color: ${color.faint};
    }
    &:focus {
        outline: none;
        border-color: ${color.accent};
    }
`;
