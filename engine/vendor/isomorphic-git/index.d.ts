export interface GitChange {
  status: 'untracked' | 'modified' | 'deleted';
  path: string;
}

export interface GitCommitResult {
  commitOid: string;
  treeOid: string;
  parentOid: string | null;
  fileCount: number;
}

export interface GitLogEntry {
  oid: string;
  tree: string | null;
  parent: string | null;
  author: string;
  message: string;
}

export function init(opts: { dir: string; defaultBranch?: string }): Promise<{ gitDir: string; defaultBranch: string }>;
export function addAll(opts: { dir: string }): Promise<any[]>;
export function status(opts: { dir: string }): Promise<{ initialized: boolean; changes: GitChange[] }>;
export function commit(opts: {
  dir: string;
  message: string;
  author?: { name: string; email: string };
}): Promise<GitCommitResult>;
export function log(opts: { dir: string; depth?: number }): Promise<GitLogEntry[]>;

declare const isoGit: {
  init: typeof init;
  addAll: typeof addAll;
  status: typeof status;
  commit: typeof commit;
  log: typeof log;
};

export default isoGit;
