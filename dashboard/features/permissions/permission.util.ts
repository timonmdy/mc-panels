import type { ServerGrant } from '../../api/api.types';
import type { useConfirmation } from '../../framework/ui';

const DANGEROUS_GRANTS: ServerGrant[] = ['layouts.edit', 'profiles.manage', 'data.manage', 'ips.view'];
type Confirm = ReturnType<typeof useConfirmation>;

export const confirmPermissionGrant = async (
    confirm: Confirm,
    permissions: ServerGrant[],
    description: string,
): Promise<boolean> => {
    const dangerous = permissions.filter((permission) => DANGEROUS_GRANTS.includes(permission));
    if (dangerous.length === 0) return true;

    const labels: Record<ServerGrant, string> = {
        view: 'view the dashboard',
        'layouts.edit': 'change dashboard layouts',
        'profiles.manage': 'create and delete dashboard profiles',
        'data.view': 'view stored server data',
        'data.manage': 'edit and delete stored server data',
        'ips.view': 'view player IP addresses',
    };

    return confirm({
        title: 'Confirm elevated permissions',
        message: `This grants ${description} permission to ${dangerous.map((permission) => labels[permission]).join(', ')}. Only grant these permissions to people you trust.`,
        confirmLabel: 'Grant permissions',
        destructive: false,
    });
};
