import React, { useState } from 'react';
import { Badge, EmptyState, Segmented } from '../../framework/ui';
import { useIssues } from '../../data/data.hooks';
import { List, ListRow } from '../shared/ListRow/ListRow';
import { PanelError, PanelLoading } from '../shared/PanelError/PanelError';
import type { PanelProps } from '../registry/panel.types';
import { Count, Head, Message } from './ConsoleIssuesPanel.styles';

type Level = 'all' | 'error' | 'warn';

export const ConsoleIssuesPanel = ({ settings }: PanelProps) => {
    const [level, setLevel] = useState<Level>(settings.defaultLevel === 'error' || settings.defaultLevel === 'warn' ? settings.defaultLevel : 'all');
    const ignorePatterns = Array.isArray(settings.ignorePatterns)
        ? settings.ignorePatterns.filter((pattern): pattern is string => typeof pattern === 'string')
        : [];
    const issues = useIssues(level, Number(settings.maxRows) || 30, ignorePatterns);

    if (issues.error && !issues.data) return <PanelError message={issues.error} />;
    if (!issues.data) return <PanelLoading />;

    const { counts, entries } = issues.data;

    return (
        <>
            <Head>
                <Segmented<Level>
                    value={level}
                    onChange={setLevel}
                    options={[
                        { value: 'all', label: `All ${counts.all}` },
                        { value: 'error', label: `Errors ${counts.error}` },
                        { value: 'warn', label: `Warnings ${counts.warn}` },
                    ]}
                />
            </Head>
            {!entries.length ? (
                <EmptyState icon='console' title='Console is clean' hint='No errors or warnings in the current log.' />
            ) : (
                <List>
                    {entries.map((entry, i) => (
                        <ListRow key={`${entry.level}-${i}`} title={entry.message}>
                            <Badge $tone={entry.level === 'error' ? 'bad' : 'warn'}>{entry.level === 'error' ? 'ERROR' : 'WARN'}</Badge>
                            <Message>{entry.message}</Message>
                            <Count>x{entry.count}</Count>
                        </ListRow>
                    ))}
                </List>
            )}
        </>
    );
};
