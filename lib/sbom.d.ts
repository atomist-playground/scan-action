export declare function createSbom(image: string): Promise<string>;
export declare const SYFT_BINARY_NAME = "syft";
export declare const SYFT_VERSION = "v0.21.0";
/**
 * Downloads the appropriate Syft binary for the platform
 */
export declare function downloadSyft(): Promise<string>;
/**
 * Gets the Syft command to run via exec
 */
export declare function getSyftCommand(): Promise<string>;
//# sourceMappingURL=sbom.d.ts.map