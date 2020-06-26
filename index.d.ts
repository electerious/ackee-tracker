export interface ServerDetails {
  server: string;
  domainId: string;
}

export interface TrackingOptions {
  /**
   * Defaults to `true`
   */
  ignoreLocalhost?: boolean;
  /**
   * Defaults to `false`
   */
  detailed?: boolean;
}

export interface DefaultData {
  siteLocation: string;
  siteReferrer: string;
}

// Based on https://github.com/bestiejs/platform.js/blob/master/platform.js
export interface DetailedData {
  siteLanguage: string;
  screenWidth: number;
  screenHeight: number;
  screenColorDepth: number;
  deviceName: string | null;
  deviceManufacturer: string | null;
  osName: string | null;
  osVersion: string | null;
  browserName: string | null;
  browserVersion: string | null;
  browserWidth: number;
  browserHeight: number;
}

export function attributes(detailed: true): DefaultData & DetailedData;
export function attributes(detailed?: false): DefaultData;

export function detect(): void;

export function create(
  serverDetails: ServerDetails,
  options?: TrackingOptions
): { record: (attrs?: ReturnType<typeof attributes>) => () => void };
