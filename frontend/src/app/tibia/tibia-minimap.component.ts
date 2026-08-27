import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  computed,
  effect,
  input,
  viewChild,
} from '@angular/core';
import {
  DEFAULT_MAP_ZOOM,
  TIBIA_MINIMAP_TILE_SIZE,
  buildTibiaMinimapTileUrl,
  tibiaMinimapSectorOrigin,
  type Coordinates,
  type TibiaRoute,
  type TibiaRouteMarkerIcon,
} from './tibia-map';

const DEFAULT_MINIMAP_SIZE = 320;

interface PixelPoint {
  x: number;
  y: number;
}

interface PixelMarker extends PixelPoint {
  icon: TibiaRouteMarkerIcon;
}

interface PixelPath {
  points: string;
}

interface TileViewport {
  floor: number;
  worldLeft: number;
  worldTop: number;
  zoom: number;
}

@Component({
  selector: 'app-tibia-minimap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tibia-minimap.component.html',
  styleUrl: './tibia-minimap.component.scss',
})
export class TibiaMinimapComponent {
  readonly coordinates = input.required<Coordinates>();
  readonly zoom = input<number>(DEFAULT_MAP_ZOOM);
  readonly route = input<TibiaRoute | undefined>(undefined);
  readonly size = input<number>(DEFAULT_MINIMAP_SIZE);

  protected readonly worldLeft = computed(
    () => this.coordinates().x - this.size() / 2 / this.zoom(),
  );
  protected readonly worldTop = computed(
    () => this.coordinates().y - this.size() / 2 / this.zoom(),
  );

  protected readonly markerPoints = computed<PixelMarker[]>(() =>
    (this.route()?.markers ?? [])
      .filter((marker) => marker.floor === this.coordinates().z)
      .map((marker) => ({ icon: marker.icon, ...this.toPixel(marker.x, marker.y) })),
  );

  protected readonly pathPolylines = computed<PixelPath[]>(() =>
    (this.route()?.paths ?? [])
      .filter((path) => path.floor === this.coordinates().z)
      .map((path) => ({
        points: path.points.map((point) => this.toPixelString(point.x, point.y)).join(' '),
      })),
  );

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    effect(() => {
      void this.drawTiles(this.coordinates(), this.zoom(), this.size());
    });
  }

  private toPixel(worldX: number, worldY: number): PixelPoint {
    return {
      x: (worldX - this.worldLeft()) * this.zoom(),
      y: (worldY - this.worldTop()) * this.zoom(),
    };
  }

  private toPixelString(worldX: number, worldY: number): string {
    const { x, y } = this.toPixel(worldX, worldY);
    return `${x},${y}`;
  }

  private async drawTiles(coordinates: Coordinates, zoom: number, size: number): Promise<void> {
    const context = this.prepareCanvas(size);
    if (!context) {
      return;
    }

    const worldLeft = coordinates.x - size / 2 / zoom;
    const worldTop = coordinates.y - size / 2 / zoom;
    const worldSize = size / zoom;
    const viewport: TileViewport = { floor: coordinates.z, worldLeft, worldTop, zoom };

    const sectorFromX = tibiaMinimapSectorOrigin(worldLeft);
    const sectorFromY = tibiaMinimapSectorOrigin(worldTop);
    const sectorToX = tibiaMinimapSectorOrigin(worldLeft + worldSize);
    const sectorToY = tibiaMinimapSectorOrigin(worldTop + worldSize);

    const tileLoads: Promise<void>[] = [];
    for (let sectorX = sectorFromX; sectorX <= sectorToX; sectorX += TIBIA_MINIMAP_TILE_SIZE) {
      for (let sectorY = sectorFromY; sectorY <= sectorToY; sectorY += TIBIA_MINIMAP_TILE_SIZE) {
        tileLoads.push(this.drawTile(context, sectorX, sectorY, viewport));
      }
    }
    await Promise.all(tileLoads);
  }

  private prepareCanvas(size: number): CanvasRenderingContext2D | null {
    const canvas = this.canvas().nativeElement;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (context) {
      context.imageSmoothingEnabled = false;
    }
    return context;
  }

  private drawTile(
    context: CanvasRenderingContext2D,
    sectorX: number,
    sectorY: number,
    viewport: TileViewport,
  ): Promise<void> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = (): void => {
        const destX = (sectorX - viewport.worldLeft) * viewport.zoom;
        const destY = (sectorY - viewport.worldTop) * viewport.zoom;
        const destSize = TIBIA_MINIMAP_TILE_SIZE * viewport.zoom;
        context.drawImage(image, destX, destY, destSize, destSize);
        resolve();
      };
      // Unexplored sector - no tile published, leave the canvas background as-is.
      image.onerror = (): void => resolve();
      image.src = buildTibiaMinimapTileUrl(sectorX, sectorY, viewport.floor);
    });
  }
}
