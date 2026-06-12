import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SpotifyWidgetComponent } from './spotify-widget.component';
import {
  SpotifyEmbedService,
  SpotifyEmbedController,
} from './spotify-embed.service';

describe('SpotifyWidgetComponent', () => {
  let component: SpotifyWidgetComponent;
  let fixture: ComponentFixture<SpotifyWidgetComponent>;
  let httpMock: HttpTestingController;
  let embedService: jasmine.SpyObj<SpotifyEmbedService>;
  let controller: jasmine.SpyObj<SpotifyEmbedController>;

  const mockTrack = {
    id: 'track123',
    name: 'Mr. Brightside',
    artist: 'The Killers',
    albumCover: 'https://example.com/cover.jpg',
  };

  beforeEach(async () => {
    controller = jasmine.createSpyObj<SpotifyEmbedController>('controller', [
      'play',
      'destroy',
      'addListener',
    ]);
    embedService = jasmine.createSpyObj<SpotifyEmbedService>('SpotifyEmbedService', [
      'createController',
    ]);
    embedService.createController.and.resolveTo(controller);

    await TestBed.configureTestingModule({
      imports: [SpotifyWidgetComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SpotifyEmbedService, useValue: embedService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotifyWidgetComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function flushInitialRequest() {
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=short_term')
      .flush(mockTrack);
    fixture.detectChanges();
  }

  it('should create', () => {
    flushInitialRequest();
    expect(component).toBeTruthy();
  });

  it('should be in loading state on init before response', () => {
    expect(component.status()).toBe('loading');
    flushInitialRequest();
  });

  it('should set status loaded and track on success', () => {
    flushInitialRequest();
    expect(component.status()).toBe('loaded');
    expect(component.track()).toEqual(mockTrack);
  });

  it('should set status error and null track on HTTP error', () => {
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=short_term')
      .error(new ErrorEvent('Network error'));
    expect(component.status()).toBe('error');
    expect(component.track()).toBeNull();
  });

  it('should have 4 options including liked', () => {
    expect(component.ranges.map((r) => r.value)).toEqual([
      'short_term',
      'medium_term',
      'long_term',
      'liked',
    ]);
    flushInitialRequest();
  });

  it('should fetch with time_range=liked when liked pill selected', () => {
    flushInitialRequest();
    component.selectRange('liked');
    expect(component.status()).toBe('loading');
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=liked')
      .flush(mockTrack);
    expect(component.status()).toBe('loaded');
  });

  it('should render the native card with track info', () => {
    flushInitialRequest();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.track-card__name')?.textContent).toContain(
      'Mr. Brightside'
    );
    expect(el.querySelector('.track-card__artist')?.textContent).toContain(
      'The Killers'
    );
    const cover = el.querySelector<HTMLImageElement>('.track-card__cover');
    expect(cover?.src).toBe(mockTrack.albumCover);
    const link = el.querySelector<HTMLAnchorElement>('.track-card__spotify-link');
    expect(link?.href).toContain('open.spotify.com/track/track123');
  });

  it('should swap to player view and create a controller on play', async () => {
    flushInitialRequest();
    component.startPlayback();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.view()).toBe('player');
    expect(embedService.createController).toHaveBeenCalledWith(
      jasmine.any(HTMLElement),
      'track123'
    );
    expect(fixture.nativeElement.querySelector('.player-shell')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.track-card')).toBeFalsy();
  });

  it('should destroy controller and return to card on close', async () => {
    flushInitialRequest();
    component.startPlayback();
    fixture.detectChanges();
    await fixture.whenStable();

    component.closePlayer();
    fixture.detectChanges();

    expect(controller.destroy).toHaveBeenCalled();
    expect(component.view()).toBe('card');
    expect(fixture.nativeElement.querySelector('.track-card')).toBeTruthy();
  });

  it('should return to card view when range changes while playing', async () => {
    flushInitialRequest();
    component.startPlayback();
    fixture.detectChanges();
    await fixture.whenStable();

    component.selectRange('medium_term');
    fixture.detectChanges();

    expect(controller.destroy).toHaveBeenCalled();
    expect(component.view()).toBe('card');
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=medium_term')
      .flush(mockTrack);
  });

  it('should serve cached track without HTTP call when returning to a visited range', () => {
    flushInitialRequest();
    component.selectRange('medium_term');
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=medium_term')
      .flush({ ...mockTrack, id: 'other' });

    component.selectRange('short_term');
    httpMock.expectNone(
      '/.netlify/functions/spotify-top-track?time_range=short_term'
    );
    expect(component.status()).toBe('loaded');
    expect(component.track()?.id).toBe('track123');
  });

  it('should not cache errors and retry the range on next selection', () => {
    flushInitialRequest();
    component.selectRange('medium_term');
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=medium_term')
      .error(new ErrorEvent('Network error'));

    component.selectRange('medium_term');
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=medium_term')
      .flush(mockTrack);
    expect(component.status()).toBe('loaded');
  });

  it('should show translated error state', () => {
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=short_term')
      .error(new ErrorEvent('Network error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.spotify-error')).toBeTruthy();
  });
});
