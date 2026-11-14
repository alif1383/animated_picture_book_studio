declare class Buffer extends Uint8Array {
  static alloc(size: number, fill?: number | string): Buffer;
  static from(data: any, encoding?: string): Buffer;
  static concat(list: ReadonlyArray<Uint8Array>, totalLength?: number): Buffer;
  static compare(buf1: Uint8Array, buf2: Uint8Array): number;
  write(string: string, offset?: number, length?: number, encoding?: string): number;
  writeUInt32BE(value: number, offset?: number): number;
  writeUInt32LE(value: number, offset?: number): number;
  writeUInt16BE(value: number, offset?: number): number;
  writeUInt16LE(value: number, offset?: number): number;
  writeInt16LE(value: number, offset?: number): number;
  readUInt32BE(offset?: number): number;
  readUInt32LE(offset?: number): number;
  readUInt16LE(offset?: number): number;
  copy(target: Uint8Array, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
  subarray(begin?: number, end?: number): Buffer;
  toString(encoding?: string, start?: number, end?: number): string;
}

declare var process: {
  cwd(): string;
  execPath: string;
  platform: string;
  argv: string[];
  env: Record<string, string | undefined>;
  exit(code?: number): never;
};

declare module 'node:fs' {
  const fs: any;
  export default fs;
}
declare module 'node:os' {
  const os: any;
  export default os;
}
declare module 'node:path' {
  const path: any;
  export default path;
}
declare module 'node:zlib' {
  const zlib: any;
  export default zlib;
}
declare module 'node:child_process' {
  export function spawnSync(command: string, args?: ReadonlyArray<string>, options?: any): any;
}
