import { Directive, ElementRef, inject, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ScrollRevealService } from '../../services/scroll-reveal.service';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input() appScrollReveal: 'reveal' | 'reveal-left' | 'stagger-reveal' = 'reveal';
  @Input() staggerIndex = 0;

  private el = inject(ElementRef<HTMLElement>);
  private revealService = inject(ScrollRevealService);
  private renderer = inject(Renderer2);

  ngOnInit(): void {
    const nativeEl = this.el.nativeElement;
    this.renderer.addClass(nativeEl, this.appScrollReveal);
    if (this.appScrollReveal === 'stagger-reveal') {
      this.renderer.setStyle(nativeEl, '--stagger-index', String(this.staggerIndex));
    }
    this.revealService.observe(nativeEl, () => {
      this.renderer.addClass(nativeEl, 'revealed');
    });
  }

  ngOnDestroy(): void {
    this.revealService.unobserve(this.el.nativeElement);
  }
}
