import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { SupportedLanguage } from './language.service';

export type ContactTopic = 'pro' | 'project' | 'general';

export interface ContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  message: string;
  topic: ContactTopic;
  lang: SupportedLanguage;
  website: string; // honeypot: always empty for humans
  fillMs: number; // time spent on the form, measured client-side (bots submit instantly)
}

/** Opens the contact dialog (rendered once in the shell) and sends its content. */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  /** Topic of the open dialog; null when closed. */
  readonly topic = signal<ContactTopic | null>(null);

  open(topic: ContactTopic): void {
    this.topic.set(topic);
  }

  close(): void {
    this.topic.set(null);
  }

  send(request: ContactRequest): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>('/.netlify/functions/contact', request);
  }
}
