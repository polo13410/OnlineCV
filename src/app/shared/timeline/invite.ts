import { LINKEDIN_URL } from '../contact';
import { TimelineInvite } from './timeline.component';

type InvitePage = 'EXPERIENCES' | 'PROJECTS';

/** Translation keys an invitation needs, to pass to TranslateService.stream(). */
export function inviteKeys(page: InvitePage): string[] {
  return ['META', 'TITLE', 'TEXT', 'CTA'].map(k => `${page}.INVITE.${k}`).concat('CARD.LINKEDIN');
}

/** "Next chapter" slot: a call to action opening the contact form + LinkedIn. */
export function buildInvite(page: InvitePage, labels: Record<string, string>, openForm: () => void, year = new Date().getFullYear()): TimelineInvite {
  const t = (key: string) => labels[`${page}.INVITE.${key}`];
  return {
    meta: [{ label: t('META'), value: `${year} → ?`, emphasis: true }],
    title: t('TITLE'),
    text: t('TEXT'),
    cta: { label: t('CTA'), action: openForm },
    secondary: { label: labels['CARD.LINKEDIN'], href: LINKEDIN_URL },
  };
}
