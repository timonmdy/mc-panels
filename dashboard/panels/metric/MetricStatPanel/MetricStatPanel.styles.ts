import styled from 'styled-components';
import { color } from '../../../framework/theme';

export const Root = styled.div`
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr);
    gap: 4px;
    height: 100%;
`;

export const Top = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
`;

export const Value = styled.div<{ $tone: string }>`
    display: flex;
    align-items: baseline;
    gap: 6px;
    min-width: 0;
    color: ${(p) => p.$tone};
    font-size: 30px;
    font-weight: 700;
    line-height: 1.1;
    white-space: nowrap;

    small {
        color: ${color.muted};
        font-size: 14px;
        font-weight: 500;
    }
`;

export const DeltaChip = styled.span<{ $tone: string }>`
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid ${(p) => p.$tone};
    color: ${(p) => p.$tone};
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
`;

export const Meta = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    color: ${color.muted};
    font-size: 11px;

    strong {
        color: ${color.text};
        font-weight: 600;
    }
`;

export const SparkWrap = styled.div`
    min-height: 0;
    align-self: end;
    height: 100%;
    max-height: 56px;
`;
