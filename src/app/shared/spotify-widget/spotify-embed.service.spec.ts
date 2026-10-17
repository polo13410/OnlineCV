import { afterEach, beforeEach, describe, expect, it, type Mock, type MockInstance, type MockedObject, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SpotifyEmbedService, SpotifyEmbedController } from './spotify-embed.service';

interface FakeApi {
  createController: Mock;
}

describe('SpotifyEmbedService', () => {
  let service: SpotifyEmbedService;
  let appendSpy: MockInstance;

  afterEach(() => vi.restoreAllMocks());

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyEmbedService);
    // Prevent the real Spotify script from loading during tests
    appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(
      ((node: Node) => node) as never
    );
    delete (window as { onSpotifyIframeApiReady?: unknown }).onSpotifyIframeApiReady;
  });

  function makeController(): MockedObject<SpotifyEmbedController> {
    return {
      play: vi.fn(),
      destroy: vi.fn(),
      addListener: vi.fn(),
    };
  }

  function resolveApi(controller: SpotifyEmbedController): FakeApi {
    const api: FakeApi = { createController: vi.fn() };
    api.createController.mockImplementation(
      (_el: HTMLElement, _opts: unknown, cb: (c: SpotifyEmbedController) => void) =>
        cb(controller)
    );
    (window as unknown as { onSpotifyIframeApiReady: (a: FakeApi) => void })
      .onSpotifyIframeApiReady(api);
    return api;
  }

  it('injects the embed script only once across calls', async () => {
    const controller = makeController();
    const p1 = service.createController(document.createElement('div'), 'aaa');
    const p2 = service.createController(document.createElement('div'), 'bbb');
    expect(appendSpy).toHaveBeenCalledTimes(1);
    resolveApi(controller);
    await Promise.all([p1, p2]);
  });

  it('creates a controller with the track uri and autoplays on ready', async () => {
    const controller = makeController();
    const host = document.createElement('div');
    const promise = service.createController(host, 'track123');
    const api = resolveApi(controller);

    const result = await promise;

    expect(api.createController).toHaveBeenCalledWith(
      host,
      expect.objectContaining({ uri: 'spotify:track:track123' }),
      expect.any(Function)
    );
    expect(result).toBe(controller);

    expect(controller.addListener).toHaveBeenCalledWith('ready', expect.any(Function));
    const readyCb = controller.addListener.mock.lastCall![1] as () => void;
    readyCb();
    expect(controller.play).toHaveBeenCalled();
  });
});
