declare module 'leaflet' {
  // Minimal shims to satisfy TS where @types/leaflet is unavailable.
  export interface IconOptions {
    iconUrl: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
    popupAnchor?: [number, number];
    className?: string;
  }

  export class DivIcon {
    constructor(options?: { html?: string; className?: string; iconSize?: [number, number] });
  }

  export function icon(options: IconOptions): any;

  const L: {
    icon: typeof icon;
    DivIcon: typeof DivIcon;
  } & Record<string, any>;

  export default L;
}

