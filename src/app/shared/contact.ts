export const LINKEDIN_URL = 'https://www.linkedin.com/in/paulpera/';
export const GITHUB_URL = 'https://github.com/polo13410';

export function mailto(address: string, subject: string): string {
  return `mailto:${address}?subject=${encodeURIComponent(subject)}`;
}
