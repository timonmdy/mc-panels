import { apiSend } from './client';
import type { Layout, ProfileDto } from './api.types';

export const createProfile = (uuid: string, kind: ProfileDto['kind'], name: string, layout: Layout) =>
    apiSend<ProfileDto>('post', uuid, '/profiles', { kind, name, layout });

export const updateProfile = (uuid: string, id: number, changes: Partial<Pick<ProfileDto, 'name' | 'layout'>>) =>
    apiSend<ProfileDto>('patch', uuid, `/profiles/${id}`, changes);

export const deleteProfile = (uuid: string, id: number) => apiSend<void>('delete', uuid, `/profiles/${id}`);
