import { TestBed } from '@angular/core/testing';
import { SpotifyEmbedService, SpotifyEmbedController } from './spotify-embed.service';

interface FakeApi {
  createController: jasmine.Spy;
}

describe('SpotifyEmbedService', () => {
  let service: SpotifyEmbedService;
  let appendSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyEmbedService);
    // Prevent the real Spotify script from loading in Karma
    appendSpy = spyOn(document.body, 'appendChild').and.callFake(
      ((node: Node) => node) as never
    );
    delete (window as { onSpotifyIframeApiReady?: unknown }).onSpotifyIframeApiReady;
  });

  function makeController(): jasmine.SpyObj<SpotifyEmbedController> {
    return jasmine.createSpyObj<SpotifyEmbedController>('controller', [
      'play',
      'destroy',
      'addListener',
    ]);
  }

  function resolveApi(controller: SpotifyEmbedController): FakeApi {
    const api: FakeApi = { createController: jasmine.createSpy('createController') };
    api.createController.and.callFake(
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
      jasmine.objectContaining({ uri: 'spotify:track:track123' }),
      jasmine.any(Function)
    );
    expect(result).toBe(controller);

    expect(controller.addListener).toHaveBeenCalledWith('ready', jasmine.any(Function));
    const readyCb = controller.addListener.calls.mostRecent().args[1] as () => void;
    readyCb();
    expect(controller.play).toHaveBeenCalled();
  });
});
