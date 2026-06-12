import { Component, viewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConstellationCardDirective } from './constellation-card.directive';

@Component({
  standalone: true,
  imports: [ConstellationCardDirective],
  template: `
    <ng-template appConstellationCard="spotify">spotify</ng-template>
    <ng-template appConstellationCard="autre">autre</ng-template>
  `,
})
class HostComponent {
  readonly directives = viewChildren(ConstellationCardDirective);
}

describe('ConstellationCardDirective', () => {
  it('exposes its templateId and TemplateRef', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const directives = fixture.componentInstance.directives();
    expect(directives.length).toBe(2);
    expect(directives[0].templateId).toBe('spotify');
    expect(directives[1].templateId).toBe('autre');
    expect(directives[0].template).toBeTruthy();
  });
});
