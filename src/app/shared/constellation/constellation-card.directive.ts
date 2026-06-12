import { Directive, inject, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[appConstellationCard]',
  standalone: true,
})
export class ConstellationCardDirective {
  @Input({ alias: 'appConstellationCard', required: true }) templateId!: string;
  readonly template = inject(TemplateRef<unknown>);
}
