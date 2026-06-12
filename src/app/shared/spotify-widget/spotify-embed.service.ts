import { Injectable } from '@angular/core';

export interface SpotifyEmbedController {
  play(): void;
  destroy(): void;
  addListener(event: string, callback: () => void): void;
}

interface SpotifyIframeApi {
  createController(
    element: HTMLElement,
    options: { uri: string; width: string | number; height: string | number },
    callback: (controller: SpotifyEmbedController) => void
  ): void;
}

const EMBED_SCRIPT_URL = 'https://open.spotify.com/embed/iframe-api/v1';
const EMBED_HEIGHT = 100;

@Injectable({ providedIn: 'root' })
export class SpotifyEmbedService {
  private apiPromise: Promise<SpotifyIframeApi> | null = null;

  createController(
    element: HTMLElement,
    trackId: string
  ): Promise<SpotifyEmbedController> {
    return this.loadApi().then(
      (api) =>
        new Promise<SpotifyEmbedController>((resolve) => {
          api.createController(
            element,
            { uri: `spotify:track:${trackId}`, width: '100%', height: EMBED_HEIGHT },
            (controller) => {
              controller.addListener('ready', () => controller.play());
              resolve(controller);
            }
          );
        })
    );
  }

  private loadApi(): Promise<SpotifyIframeApi> {
    if (!this.apiPromise) {
      this.apiPromise = new Promise((resolve) => {
        (
          window as unknown as {
            onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
          }
        ).onSpotifyIframeApiReady = (api) => resolve(api);
        const script = document.createElement('script');
        script.src = EMBED_SCRIPT_URL;
        script.async = true;
        document.body.appendChild(script);
      });
    }
    return this.apiPromise;
  }
}
