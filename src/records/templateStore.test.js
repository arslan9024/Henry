import { beforeEach, describe, expect, it } from 'vitest';
import { persistTenancyTemplates, updateTenancyTemplateProfile } from './templateStore';

describe('templateStore mapping profiles', () => {
	beforeEach(() => window.localStorage.clear());

	it('persists a mapping profile on a working copy', () => {
		persistTenancyTemplates([{ id: 'copy-1', kind: 'working-copy', name: 'Copy' }]);
		const profile = { mode: 'static', mappings: [{ path: 'tenant.fullName', x: 10 }] };

		const result = updateTenancyTemplateProfile({ templateId: 'copy-1', profile });

		expect(result.ok).toBe(true);
		expect(result.entry.mappingProfile).toEqual(profile);
		expect(JSON.parse(window.localStorage.getItem('henry.tenancy-builder.templates.v1'))[0]).toEqual(
			expect.objectContaining({ mappingProfile: profile, updatedAt: expect.any(String) }),
		);
	});

	it('protects master templates from profile edits', () => {
		persistTenancyTemplates([{ id: 'master-1', kind: 'master', name: 'Master' }]);
		expect(
			updateTenancyTemplateProfile({ templateId: 'master-1', profile: { mode: 'fillable' } }),
		).toEqual({ ok: false, reason: 'master-read-only' });
	});
});
