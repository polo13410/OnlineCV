import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { SpotifyWidgetComponent } from './spotify-widget.component';

describe('SpotifyWidgetComponent', () => {
  let component: SpotifyWidgetComponent;
  let fixture: ComponentFixture<SpotifyWidgetComponent>;
  let httpMock: HttpTestingController;

  const mockTrack = {
    id: 'track123',
    name: 'Mr. Brightside',
    artist: 'The Killers',
    albumCover: 'https://example.com/cover.jpg',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotifyWidgetComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotifyWidgetComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    httpMock.expectOne(r => r.url.includes('spotify-top-track')).flush(mockTrack);
    expect(component).toBeTruthy();
  });

  it('should be in loading state on init before response', () => {
    expect(component.status()).toBe('loading');
    httpMock.expectOne(r => r.url.includes('spotify-top-track')).flush(mockTrack);
  });

  it('should set status loaded and track on success', () => {
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=short_term')
      .flush(mockTrack);
    expect(component.status()).toBe('loaded');
    expect(component.track()).toEqual(mockTrack);
  });

  it('should set embedUrl on success', () => {
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=short_term')
      .flush(mockTrack);
    expect(component.embedUrl()).not.toBeNull();
  });

  it('should set status error and null track on HTTP error', () => {
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=short_term')
      .error(new ErrorEvent('Network error'));
    expect(component.status()).toBe('error');
    expect(component.track()).toBeNull();
  });

  it('should fetch with correct time_range when selectRange called', () => {
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=short_term')
      .flush(mockTrack);

    component.selectRange('medium_term');
    fixture.detectChanges();

    expect(component.selectedRange()).toBe('medium_term');
    expect(component.status()).toBe('loading');
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=medium_term')
      .flush(mockTrack);
    expect(component.status()).toBe('loaded');
  });

  it('should have 3 range options', () => {
    expect(component.ranges.length).toBe(3);
    expect(component.ranges.map(r => r.value)).toEqual([
      'short_term',
      'medium_term',
      'long_term',
    ]);
    httpMock.expectOne(r => r.url.includes('spotify-top-track')).flush(mockTrack);
  });
});
