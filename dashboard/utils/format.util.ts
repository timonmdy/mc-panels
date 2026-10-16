import { isNumber } from './number.util';

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export const NO_VALUE = '\u2014';

export const formatBytes = (bytes: number | null | undefined, decimals = 1): string => {
    if (!isNumber(bytes)) return NO_VALUE;
    if (bytes === 0) return '0 B';

    const exponent = Math.min(BYTE_UNITS.length - 1, Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)));
    const value = bytes / Math.pow(1024, exponent);

    return `${value.toFixed(exponent === 0 ? 0 : decimals)} ${BYTE_UNITS[exponent]}`;
};

export const formatRate = (bytesPerSecond: number | null | undefined): string =>
    isNumber(bytesPerSecond) ? `${formatBytes(bytesPerSecond)}/s` : NO_VALUE;

export const formatPercent = (value: number | null | undefined, decimals = 1): string =>
    isNumber(value) ? `${value.toFixed(decimals)}%` : NO_VALUE;

export const formatNumber = (value: number | null | undefined, decimals = 0): string =>
    isNumber(value) ? value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) : NO_VALUE;

export const formatDuration = (ms: number | null | undefined): string => {
    if (!isNumber(ms) || ms < 0) return NO_VALUE;

    const seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;

    return `${minutes}m ${seconds % 60}s`;
};

export const titleCase = (value: string | null | undefined): string =>
    value ? value.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : NO_VALUE;
