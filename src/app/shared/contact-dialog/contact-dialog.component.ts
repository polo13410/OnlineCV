import { Component, effect, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map, Subscription } from 'rxjs';
import { ContactService, ContactTopic } from '../../services/contact.service';
import { GetJsonService } from '../../services/get-json.service';
import { LanguageService } from '../../services/language.service';
import { mailto } from '../contact';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([tabindex="-1"]), textarea';

const TITLE_KEYS: Record<ContactTopic, string> = {
  pro: 'CONTACT.TITLE_PRO',
  project: 'CONTACT.TITLE_PROJECT',
  general: 'CONTACT.TITLE_GENERAL',
};
const SUBJECT_KEYS: Record<ContactTopic, string> = {
  pro: 'EXPERIENCES.INVITE.SUBJECT',
  project: 'PROJECTS.INVITE.SUBJECT',
  general: 'CONTACT.SUBJECT_GENERAL',
};

/**
 * Contact form overlay; opened through ContactService.open().
 * Deliberately not a native modal <dialog>: its top layer hides the custom cursor and
 * makes password-manager autofill menus (injected into the page) inert.
 */
@Component({
  selector: 'app-contact-dialog',
  templateUrl: './contact-dialog.component.html',
  styleUrl: './contact-dialog.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
})
export class ContactDialogComponent {
  readonly contact = inject(ContactService);
  private readonly translate = inject(TranslateService);
  private readonly lang = toSignal(inject(LanguageService).currentLanguage$, { requireSync: true });
  readonly email = toSignal(inject(GetJsonService).getHeader().pipe(map(h => h.mail as string)), { initialValue: '' });

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly honeypot = viewChild<ElementRef<HTMLInputElement>>('honeypot');

  readonly status = signal<Status>('idle');
  readonly sentName = signal('');
  private startedAt = 0;
  private returnFocus: HTMLElement | null = null;
  private request?: Subscription;

  readonly form = inject(FormBuilder).nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    company: ['', Validators.maxLength(120)],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
  });

  constructor() {
    // Panel just rendered → remember the opener, start the bot timer, focus the first field
    effect(() => {
      const panel = this.panel()?.nativeElement;
      if (!panel) return;
      this.returnFocus = document.activeElement as HTMLElement | null;
      this.startedAt = Date.now();
      (panel.querySelector<HTMLElement>('input') ?? panel.querySelector<HTMLElement>('button'))?.focus();
    });
  }

  close(): void {
    if (!this.contact.topic()) return;
    // A request still in flight must not update the next dialog session
    this.request?.unsubscribe();
    this.contact.close();
    this.status.set('idle');
    this.returnFocus?.focus();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const panel = this.panel()?.nativeElement;
    if (!panel) return;
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'Tab') {
      // Keep keyboard focus inside the panel
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  titleKey(): string {
    return TITLE_KEYS[this.contact.topic() ?? 'general'];
  }

  mailtoHref(): string {
    return mailto(this.email(), this.translate.instant(SUBJECT_KEYS[this.contact.topic() ?? 'general']));
  }

  showError(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const topic = this.contact.topic() ?? 'general';
    const value = this.form.getRawValue();
    this.status.set('sending');
    this.request = this.contact.send({
      ...value,
      topic,
      lang: this.lang(),
      website: this.honeypot()?.nativeElement.value ?? '',
      fillMs: Date.now() - this.startedAt,
    }).subscribe({
      next: () => {
        this.sentName.set(value.firstName);
        this.status.set('sent');
        this.form.reset();
      },
      error: () => this.status.set('error'),
    });
  }
}
