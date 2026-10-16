export type TemplateVars = Record<string, string | number | null | undefined>;

export const fillTemplate = (template: string, vars: TemplateVars): string =>
    template.replace(/\{(\w+)\}/g, (match, key: string) => {
        const value = vars[key];

        return value === null || value === undefined ? match : encodeURIComponent(String(value));
    });

export const safeHttpUrl = (raw: string): string | null => {
    try {
        const url = new URL(raw);

        return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
    } catch {
        return null;
    }
};
