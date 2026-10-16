import React, { useState } from 'react';
import styled from 'styled-components';
import { color } from '../../framework/theme';
import { Button, Field, Input, Select, TextArea, Toggle } from '../../framework/ui';
import type { SettingField } from '../../panels/registry';

const Form = styled.div`
    display: grid;
    gap: 16px;
`;

const ToggleRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    span {
        display: grid;
        gap: 2px;
        font-size: 13px;
        font-weight: 600;
    }
    small {
        color: ${color.muted};
        font-size: 12px;
        font-weight: 400;
    }
`;

const PatternEditor = styled.div`
    display: grid;
    gap: 10px;
`;

const PatternRow = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    animation: pattern-enter 140ms ease-out;

    @keyframes pattern-enter {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const LibraryRow = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
`;

const PatternHelp = styled.small`
    color: ${color.muted};
    font-size: 12px;
`;

interface Props {
    fields: SettingField[];
    values: Record<string, unknown>;
    onChange: (key: string, value: unknown) => void;
}

const asText = (value: unknown): string => (value === null || value === undefined ? '' : String(value));
const asPatterns = (value: unknown): string[] => Array.isArray(value) ? value.filter((pattern): pattern is string => typeof pattern === 'string') : [];

const RegexListField = ({
    field,
    value,
    onChange,
}: {
    field: Extract<SettingField, { kind: 'regex-list' }>;
    value: unknown;
    onChange: (value: string[]) => void;
}) => {
    const patterns = asPatterns(value);
    const [libraryValue, setLibraryValue] = useState('');
    const selectedPattern = field.library.find((entry) => entry.value === libraryValue);
    const addPattern = (pattern = '') => {
        if (patterns.length < 30) onChange([...patterns, pattern]);
    };

    return (
        <PatternEditor>
            {patterns.map((pattern, index) => (
                <PatternRow key={index}>
                    <Input
                        aria-label={`Ignore pattern ${index + 1}`}
                        maxLength={256}
                        placeholder='/pattern/i'
                        value={pattern}
                        onChange={(event) => onChange(patterns.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                    />
                    <Button
                        size='sm'
                        variant='ghost'
                        icon='trash'
                        aria-label={`Remove ignore pattern ${index + 1}`}
                        title={`Remove ignore pattern ${index + 1}`}
                        onClick={() => onChange(patterns.filter((_, itemIndex) => itemIndex !== index))}
                    />
                </PatternRow>
            ))}
            <Button size='sm' variant='secondary' icon='plus' disabled={patterns.length >= 30} onClick={() => addPattern()}>
                Add pattern
            </Button>
            <LibraryRow>
                <Select
                    aria-label='Common ignore pattern library'
                    options={[
                        { value: '', label: 'Choose a common pattern…' },
                        ...field.library.map(({ value: pattern, label }) => ({ value: pattern, label })),
                    ]}
                    value={libraryValue}
                    onChange={setLibraryValue}
                />
                <Button
                    size='sm'
                    variant='secondary'
                    icon='plus'
                    disabled={!selectedPattern || patterns.includes(libraryValue) || patterns.length >= 30}
                    onClick={() => selectedPattern && addPattern(selectedPattern.value)}
                >
                    Add
                </Button>
            </LibraryRow>
            {selectedPattern && <PatternHelp>{selectedPattern.description}</PatternHelp>}
        </PatternEditor>
    );
};

export const SettingsForm = ({ fields, values, onChange }: Props) => (
    <Form>
        {fields.map((field) => {
            switch (field.kind) {
                case 'toggle':
                    return (
                        <ToggleRow key={field.key}>
                            <span>
                                {field.label}
                                {field.help && <small>{field.help}</small>}
                            </span>
                            <Toggle label={field.label} value={Boolean(values[field.key])} onChange={(v) => onChange(field.key, v)} />
                        </ToggleRow>
                    );
                case 'select':
                    return (
                        <Field key={field.key} label={field.label} help={field.help}>
                            <Select options={field.options} value={asText(values[field.key])} onChange={(v) => onChange(field.key, v)} />
                        </Field>
                    );
                case 'number':
                    return (
                        <Field key={field.key} label={field.label} help={field.help}>
                            <Input
                                type='number'
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                placeholder={field.placeholder}
                                value={asText(values[field.key])}
                                onChange={(e) => onChange(field.key, e.target.value === '' ? null : Number(e.target.value))}
                            />
                        </Field>
                    );
                case 'regex-list':
                    return (
                        <Field key={field.key} label={field.label} help={field.help}>
                            <RegexListField field={field} value={values[field.key]} onChange={(value) => onChange(field.key, value)} />
                        </Field>
                    );
                default:
                    return (
                        <Field key={field.key} label={field.label} help={field.help}>
                            {field.multiline ? (
                                <TextArea maxLength={field.maxLength} placeholder={field.placeholder} value={asText(values[field.key])} onChange={(e) => onChange(field.key, e.target.value)} />
                            ) : (
                                <Input maxLength={field.maxLength} placeholder={field.placeholder} value={asText(values[field.key])} onChange={(e) => onChange(field.key, e.target.value)} />
                            )}
                        </Field>
                    );
            }
        })}
    </Form>
);
