import { useCallback, useEffect, useRef, useState } from 'react';
import type { Layout, ProfileDto } from '../../api/api.types';
import { createProfile, deleteProfile, updateProfile } from '../../api/profiles.api';
import { errorMessage } from '../../api/client';
import { STORAGE_KEYS } from '../../config/storage.config';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { BUILT_IN_TEMPLATES, DEFAULT_TEMPLATE_ID } from '../templates/templates.config';
import { cloneLayout, layoutFromSpec } from '../templates/templates.util';

const SAVE_DELAY_MS = 600;
const VIRTUAL_ID = 0;

interface Initial {
    profiles: ProfileDto[];
    templates: ProfileDto[];
}

const defaultLayout = (): Layout => layoutFromSpec(BUILT_IN_TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE_ID) ?? BUILT_IN_TEMPLATES[0]);

export const useProfiles = (uuid: string, initial: Initial, canEditProfiles: boolean, canEditLayouts: boolean) => {
    const [profiles, setProfiles] = useState<ProfileDto[]>(() =>
        initial.profiles.length || canEditProfiles ? initial.profiles : [{ id: VIRTUAL_ID, kind: 'profile', name: 'Overview', layout: defaultLayout(), position: 0 }]
    );
    const [templates, setTemplates] = useState<ProfileDto[]>(initial.templates);
    const [storedId, setStoredId] = useLocalStorage<number | null>(STORAGE_KEYS.profile(uuid), null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const timers = useRef(new Map<number, number>());

    const active = profiles.find((profile) => profile.id === storedId) ?? profiles[0] ?? null;

    const fail = (e: unknown) => setError(errorMessage(e));

    const create = useCallback(
        async (name: string, layout: Layout, kind: ProfileDto['kind'] = 'profile') => {
            try {
                const created = await createProfile(uuid, kind, name, layout);
                if (kind === 'profile') {
                    setProfiles((list) => [...list, created]);
                    setStoredId(created.id);
                } else {
                    setTemplates((list) => [...list, created]);
                }
            } catch (e) {
                fail(e);
            }
        },
        [uuid]
    );

    useEffect(() => {
        if (canEditProfiles && profiles.length === 0) create('Overview', defaultLayout());
    }, []);

    const flush = (id: number, changes: Partial<Pick<ProfileDto, 'name' | 'layout'>>) => {
        window.clearTimeout(timers.current.get(id));
        setSaving(true);
        timers.current.set(
            id,
            window.setTimeout(async () => {
                try {
                    await updateProfile(uuid, id, changes);
                    setError(null);
                } catch (e) {
                    fail(e);
                } finally {
                    setSaving(false);
                }
            }, SAVE_DELAY_MS)
        );
    };

    const setLayout = useCallback(
        (id: number, layout: Layout) => {
            setProfiles((list) => list.map((profile) => (profile.id === id ? { ...profile, layout } : profile)));
            if (canEditLayouts && id !== VIRTUAL_ID) flush(id, { layout });
        },
        [canEditLayouts, uuid]
    );

    const rename = async (id: number, name: string) => {
        setProfiles((list) => list.map((profile) => (profile.id === id ? { ...profile, name } : profile)));
        try {
            await updateProfile(uuid, id, { name });
        } catch (e) {
            fail(e);
        }
    };

    const remove = async (id: number, kind: ProfileDto['kind'] = 'profile') => {
        try {
            await deleteProfile(uuid, id);
            kind === 'profile' ? setProfiles((list) => list.filter((profile) => profile.id !== id)) : setTemplates((list) => list.filter((t) => t.id !== id));
        } catch (e) {
            fail(e);
        }
    };

    const duplicate = (profile: ProfileDto) => create(`${profile.name} copy`, cloneLayout(profile.layout));

    return { profiles, templates, active, setActive: setStoredId, setLayout, create, rename, remove, duplicate, error, saving, dismissError: () => setError(null) };
};
