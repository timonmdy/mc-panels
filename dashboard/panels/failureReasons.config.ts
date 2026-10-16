import type { FailureReason } from '../api/api.types';
import { palette } from '../framework/theme';

export const FAILURE_REASONS: Record<FailureReason, { label: string; color: string }> = {
    aborted: { label: 'Player aborted', color: palette.muted },
    timeout: { label: 'Timed out', color: palette.warn },
    not_whitelisted: { label: 'Not whitelisted', color: palette.accent },
    banned: { label: 'Banned', color: palette.bad },
    version_mismatch: { label: 'Version mismatch', color: palette.violet },
    server_full: { label: 'Server full', color: palette.cyan },
    auth_failed: { label: 'Authentication failed', color: palette.pink },
    duplicate_login: { label: 'Duplicate login', color: palette.warn },
    protocol_error: { label: 'Invalid packets', color: palette.faint },
    other: { label: 'Other', color: palette.muted },
};
