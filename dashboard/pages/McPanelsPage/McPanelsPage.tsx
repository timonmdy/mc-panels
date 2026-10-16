import React, { useEffect, useMemo, useState } from 'react';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { ServerContext } from '@/state/server';
import type { Bootstrap } from '../../api/api.types';
import { apiErrorDetails, errorMessage } from '../../api/client';
import { fetchBootstrap } from '../../api/endpoints.api';
import { STORAGE_KEYS } from '../../config/storage.config';
import { DashboardContext } from '../../data/DashboardContext';
import { refreshAll } from '../../data/resource.store';
import { ThemeRoot } from '../../framework/theme';
import { Button, ConfirmationProvider, EmptyState, IconButton, Menu, MenuItem, Spinner } from '../../framework/ui';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { AddPanelDialog } from '../../features/panel-picker/AddPanelDialog';
import { Dashboard } from '../../features/dashboard/Dashboard';
import { addPanel } from '../../features/dashboard/layout.util';
import { ProfileSwitcher } from '../../features/profiles/ProfileSwitcher/ProfileSwitcher';
import { useProfiles } from '../../features/profiles/useProfiles';
import { Toolbar } from '../../features/toolbar/Toolbar';
import { DataExplorerDialog } from '../../features/data-explorer/DataExplorerDialog';
import { AccessKeysDialog } from '../../features/access-keys/AccessKeysDialog';
import { AccessKeyEntryDialog } from '../../features/access-keys/AccessKeyEntryDialog';

interface StartupError {
    message: string;
    status?: number;
    code?: string;
    detail?: string;
    occurredAt: string;
}

interface ContentProps {
    uuid: string;
    bootstrap: Bootstrap;
    serverIp: string | null;
    serverPort: number | null;
    onEnterAccessKey: () => void;
}

const McPanelsContent = ({ uuid, bootstrap, serverIp, serverPort, onEnterAccessKey }: ContentProps) => {
    const { config, permissions } = bootstrap;
    const [spanKey, setSpanKey] = useLocalStorage<string>(STORAGE_KEYS.timeSpan, config.defaultTimeSpan);
    const [editing, setEditing] = useState(false);
    const [picking, setPicking] = useState(false);
    const [exploringData, setExploringData] = useState(false);
    const [managingAccessKeys, setManagingAccessKeys] = useState(false);
    const profiles = useProfiles(uuid, bootstrap, permissions.editProfiles, permissions.editLayouts);

    const span = config.timeSpans.find((s) => s.key === spanKey) ?? config.timeSpans.find((s) => s.key === config.defaultTimeSpan) ?? config.timeSpans[0];
    const context = useMemo(() => ({ uuid, config, permissions, span, serverIp, serverPort }), [uuid, config, permissions, span, serverIp, serverPort]);
    const active = profiles.active;
    const canEditActiveLayout = permissions.editLayouts && active?.id !== 0;

    return (
        <ConfirmationProvider>
        <DashboardContext.Provider value={context}>
            <Toolbar
                switcher={
                    <ProfileSwitcher
                        profiles={profiles.profiles}
                        templates={profiles.templates}
                        active={active}
                        canWrite={permissions.editProfiles}
                        onSelect={profiles.setActive}
                        onCreate={(name, layout) => profiles.create(name, layout)}
                        onRename={profiles.rename}
                        onDuplicate={profiles.duplicate}
                        onDelete={(id) => profiles.remove(id)}
                        onSaveTemplate={(name, layout) => profiles.create(name, layout, 'template')}
                        onDeleteTemplate={(template) => profiles.remove(template.id, 'template')}
                    />
                }
                spans={config.timeSpans}
                span={span.key}
                canWrite={canEditActiveLayout}
                canExploreData={permissions.viewData}
                canManageAccessKeys={permissions.manageAccessKeys}
                editing={editing}
                saving={profiles.saving}
                error={profiles.error}
                onSpan={setSpanKey}
                onRefresh={() => refreshAll()}
                onAdd={() => setPicking(true)}
                onExploreData={() => setExploringData(true)}
                onManageAccessKeys={() => setManagingAccessKeys(true)}
                onEnterAccessKey={onEnterAccessKey}
                onToggleEdit={() => setEditing((value) => !value)}
            />

            {active ? (
                <Dashboard layout={active.layout} canWrite={canEditActiveLayout} editing={editing} animationsEnabled={config.animationsEnabled} onChange={(layout) => profiles.setLayout(active.id, layout)} onAdd={() => setPicking(true)} />
            ) : (
                <EmptyState icon='layers' title='Preparing your dashboard' hint='Creating the default profile.' />
            )}

            {picking && active && (
                <AddPanelDialog
                    existingTypes={active.layout.panels.map((panel) => panel.type)}
                    onAdd={(type) => profiles.setLayout(active.id, addPanel(active.layout, type))}
                    onClose={() => setPicking(false)}
                />
            )}
            {exploringData && (
                <DataExplorerDialog
                    uuid={uuid}
                    canManage={permissions.manageData}
                    onClose={() => setExploringData(false)}
                />
            )}
            {managingAccessKeys && permissions.manageAccessKeys && (
                <AccessKeysDialog uuid={uuid} onClose={() => setManagingAccessKeys(false)} />
            )}
        </DashboardContext.Provider>
        </ConfirmationProvider>
    );
};

const McPanelsPage = () => {
    const server = ServerContext.useStoreState((state) => state.server.data);
    const [bootstrap, setBootstrap] = useState<Bootstrap | null>(null);
    const [error, setError] = useState<StartupError | null>(null);
    const [attempt, setAttempt] = useState(0);
    const [enteringAccessKey, setEnteringAccessKey] = useState(false);
    const [copyMessage, setCopyMessage] = useState<string | null>(null);
    const uuid = server?.uuid;

    useEffect(() => {
        if (!uuid) return;

        setError(null);
        setCopyMessage(null);
        fetchBootstrap(uuid).then(setBootstrap).catch((e) => {
            setError({
                message: errorMessage(e),
                ...apiErrorDetails(e),
                occurredAt: new Date().toISOString(),
            });
        });
    }, [uuid, attempt]);

    const allocation = server?.allocations.find((a) => a.isDefault);
    const diagnosticReport = error ? [
        'MC Panels failed to start.',
        `Time: ${error.occurredAt}`,
        'Request: GET /api/client/extensions/mcpanels/servers/{server}/bootstrap',
        ...(error.status ? [`HTTP status: ${error.status}`] : []),
        ...(error.code ? [`Error code: ${error.code}`] : []),
        ...(error.detail ? [`Server detail: ${error.detail}`] : []),
        `Message: ${error.message}`,
    ].join('\n') : '';

    const copyDiagnosticReport = async () => {
        try {
            if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable.');
            await navigator.clipboard.writeText(diagnosticReport);
            setCopyMessage('Diagnostic report copied.');
        } catch {
            setCopyMessage('Copy is unavailable here. Select the report text below and copy it manually.');
        }
    };

    return (
        <ServerContentBlock title='Panels'>
        <ThemeRoot $animationsEnabled={bootstrap?.config.animationsEnabled}>
            {error ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                        <Menu
                            renderTrigger={({ ref, onClick, active }) => (
                                <IconButton ref={ref} icon='more' label='Dashboard actions' onClick={onClick} active={active} />
                            )}
                        >
                            <MenuItem label='Enter access key' icon='shield' onSelect={() => setEnteringAccessKey(true)} />
                        </Menu>
                    </div>
                    <EmptyState
                        icon='warning'
                        title="MC Panels couldn't start"
                        hint={`${error.status && error.status >= 500
                            ? 'The panel server returned an internal error. Its response does not include the underlying cause; include the diagnostic report below when contacting your panel administrator.'
                            : error.message} If you were given an MC Panels access key, open the … menu and choose Enter access key.`}
                    />
                    <section aria-label='Startup diagnostics' style={{ maxWidth: 560, margin: '16px auto', padding: 12, border: '1px solid rgba(128, 128, 128, 0.35)', borderRadius: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                            <strong>Diagnostic report</strong>
                            <Button size='sm' variant='secondary' onClick={copyDiagnosticReport}>Copy report</Button>
                        </div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 12 }}>{diagnosticReport}</pre>
                        {copyMessage && <p role='status' style={{ margin: '8px 0 0', fontSize: 12 }}>{copyMessage}</p>}
                    </section>
                </>
            ) : !bootstrap || !uuid ? (
                <div style={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
                    <Spinner size={28} />
                </div>
            ) : (
                <McPanelsContent uuid={uuid} bootstrap={bootstrap} serverIp={allocation?.alias ?? allocation?.ip ?? null} serverPort={allocation?.port ?? null} onEnterAccessKey={() => setEnteringAccessKey(true)} />
            )}
            {enteringAccessKey && uuid && (
                <AccessKeyEntryDialog
                    uuid={uuid}
                    onClose={() => setEnteringAccessKey(false)}
                    onConnect={() => setAttempt((n) => n + 1)}
                />
            )}
        </ThemeRoot>
        </ServerContentBlock>
    );
};

export default McPanelsPage;
