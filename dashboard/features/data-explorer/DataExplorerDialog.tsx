import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { errorMessage } from '../../api/client';
import type { DataExplorerResponse } from '../../api/api.types';
import { deleteExplorerRow, fetchExplorerData, updateExplorerRow } from '../../api/data-explorer.api';
import { color } from '../../framework/theme';
import { Button, Input, Modal, Select, Spinner, TextArea } from '../../framework/ui';
import { useConfirmation } from '../../framework/ui';

const Controls = styled.div`
    display: grid;
    grid-template-columns: minmax(180px, 1fr) minmax(220px, 2fr);
    gap: 10px;
    margin-bottom: 14px;
`;

const Row = styled.details`
    border: 1px solid ${color.border};
    border-radius: 8px;
    margin: 8px 0;
    background: ${color.raised};

    summary {
        cursor: pointer;
        padding: 10px 12px;
        font-weight: 600;
        overflow-wrap: anywhere;
    }
`;

const Values = styled.dl`
    display: grid;
    grid-template-columns: minmax(120px, 0.6fr) minmax(0, 1.4fr);
    gap: 8px 12px;
    margin: 0;
    padding: 0 12px 12px;

    dt {
        color: ${color.muted};
        font-size: 12px;
    }

    dd {
        min-width: 0;
        margin: 0;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
    }
`;

const EditFields = styled.div`
    display: grid;
    gap: 10px;
    padding: 0 12px 12px;

    label {
        display: grid;
        gap: 5px;
        color: ${color.muted};
        font-size: 12px;
    }
`;

const RowActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 0 12px 12px;
`;

const Pager = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    color: ${color.muted};
    font-size: 12px;
`;

interface Props {
    uuid: string;
    canManage: boolean;
    onClose: () => void;
}

const stringify = (value: unknown): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);

    return String(value);
};

export const DataExplorerDialog = ({ uuid, canManage, onClose }: Props) => {
    const confirm = useConfirmation();
    const [result, setResult] = useState<DataExplorerResponse | null>(null);
    const [table, setTable] = useState('samples');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [changes, setChanges] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 250);

        return () => window.clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        let current = true;
        setLoading(true);
        setError(null);
        fetchExplorerData(uuid, table, page, search)
            .then((response) => {
                if (current) setResult(response);
            })
            .catch((failure) => {
                if (current) setError(errorMessage(failure));
            })
            .finally(() => {
                if (current) setLoading(false);
            });

        return () => {
            current = false;
        };
    }, [uuid, table, page, search, reloadKey]);

    const editable = useMemo(
        () => new Set(result?.editableColumns ?? []),
        [result?.editableColumns]
    );

    const beginEdit = (row: Record<string, unknown>) => {
        const id = Number(row.id ?? row.server_id);
        if (!Number.isFinite(id)) return;

        const initial: Record<string, string> = {};
        editable.forEach((key) => {
            initial[key] = key === 'layout' || key === 'data'
                ? JSON.stringify(row[key] ?? null, null, 2)
                : key === 'online' || key === 'banned'
                    ? row[key] ? '1' : '0'
                : row[key] === null || row[key] === undefined ? '' : String(row[key]);
        });
        setEditingId(id);
        setChanges(initial);
    };

    const save = async (id: number) => {
        if (!await confirm({
            title: 'Confirm data changes',
            message: 'Editing stored server data can break panels or alter player records. Continue?',
            confirmLabel: 'Save changes',
            destructive: false,
        })) return;
        const normalized: Record<string, unknown> = {};
        try {
            Object.entries(changes).forEach(([key, value]) => {
                normalized[key] = key === 'layout' || key === 'data'
                    ? value.trim() === '' ? null : JSON.parse(value)
                    : value === '' ? null : value;
            });
        } catch {
            setError('JSON fields must contain valid JSON.');

            return;
        }

        setSaving(true);
        try {
            await updateExplorerRow(uuid, table, id, normalized);
            setEditingId(null);
            setReloadKey((current) => current + 1);
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (row: Record<string, unknown>) => {
        const id = Number(row.id ?? row.server_id);
        if (!Number.isFinite(id) || !await confirm({
            title: 'Delete stored data?',
            message: 'This permanently deletes the selected MC Panels data row. This cannot be undone.',
        })) return;

        setSaving(true);
        try {
            await deleteExplorerRow(uuid, table, id);
            setReloadKey((current) => current + 1);
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal title='Stored data explorer' onClose={onClose} width={920}>
            <Controls>
                <Select
                    value={table}
                    options={(result?.tables ?? [{ key: 'samples', label: 'Metric samples' }]).map(({ key, label }) => ({ value: key, label }))}
                    onChange={(value) => { setTable(value); setPage(1); setEditingId(null); }}
                    aria-label='Stored data table'
                />
                <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder='Filter rows by text...' aria-label='Filter stored data' />
            </Controls>
            {error && <p role='alert' style={{ color: color.bad }}>{error}</p>}
            {loading ? <div style={{ display: 'grid', placeItems: 'center', minHeight: 120 }}><Spinner /></div> : (
                <>
                    <p style={{ color: color.muted, fontSize: 12 }}>
                        Showing {result?.data.length ?? 0} of {result?.total ?? 0} rows for this server. Expand a row to inspect its fields.
                    </p>
                    {(result?.data ?? []).map((row) => {
                        const id = Number(row.id ?? row.server_id);
                        const isEditing = editingId === id;

                        return (
                            <Row key={`${table}:${id}`}>
                                <summary>Record {id} · {result?.columns.slice(1, 4).map(({ key }) => `${key}: ${stringify(row[key])}`).join(' · ')}</summary>
                                {isEditing ? (
                                    <EditFields>
                                        {Array.from(editable).map((key) => (
                                            <label key={key}>
                                                {key.replace(/_/g, ' ')}
                                                {key === 'online' || key === 'banned'
                                                    ? <Select value={changes[key] ?? '0'} options={[{ value: '0', label: 'false' }, { value: '1', label: 'true' }]} onChange={(value) => setChanges((current) => ({ ...current, [key]: value }))} />
                                                    : key === 'layout' || key === 'data'
                                                    ? <TextArea value={changes[key] ?? ''} onChange={(event) => setChanges((current) => ({ ...current, [key]: event.target.value }))} />
                                                    : <Input value={changes[key] ?? ''} onChange={(event) => setChanges((current) => ({ ...current, [key]: event.target.value }))} />}
                                            </label>
                                        ))}
                                        <RowActions>
                                            <Button size='sm' variant='ghost' onClick={() => setEditingId(null)}>Cancel</Button>
                                            <Button size='sm' variant='primary' loading={saving} onClick={() => save(id)}>Confirm edit</Button>
                                        </RowActions>
                                    </EditFields>
                                ) : (
                                    <>
                                        <Values>
                                            {result?.columns.map(({ key, label }) => (
                                                <React.Fragment key={key}>
                                                    <dt>{label}</dt><dd>{stringify(row[key])}</dd>
                                                </React.Fragment>
                                            ))}
                                        </Values>
                                        {canManage && editable.size > 0 && (
                                            <RowActions>
                                                <Button size='sm' variant='secondary' icon='edit' onClick={() => beginEdit(row)}>Edit</Button>
                                                <Button size='sm' variant='danger' icon='trash' loading={saving} onClick={() => remove(row)}>Delete</Button>
                                            </RowActions>
                                        )}
                                    </>
                                )}
                            </Row>
                        );
                    })}
                    {!result?.data.length && <p>No stored rows match this filter.</p>}
                    <Pager>
                        <span>Page {page} · {result?.total ?? 0} total</span>
                        <span>
                            <Button size='sm' variant='ghost' disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
                            <Button size='sm' variant='ghost' disabled={page * (result?.perPage ?? 30) >= (result?.total ?? 0)} onClick={() => setPage((current) => current + 1)}>Next</Button>
                        </span>
                    </Pager>
                </>
            )}
        </Modal>
    );
};
