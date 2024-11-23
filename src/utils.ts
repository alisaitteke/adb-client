/*
 *
 *  * Copyright (c) 2024 Ali Sait Teke
 *  * "Code bridges the gap between human thought and machine execution."
 *
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { platform } from 'node:os';
import {CommandError} from "./errors";

export const execAsync = promisify(exec);

export const isWindows = platform() === 'win32';

export async function executeCommand(command: string, timeout = 30000): Promise<string> {
    try {
        const { stdout, stderr } = await execAsync(command, { timeout });
        if (stderr && !stderr.includes('Warning')) {
            throw new Error(stderr);
        }
        return stdout.trim();
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new CommandError(error.message, command);
        }
        throw error;
    }
}

export function sanitizePath(path: string): string {
    return path.replace(/(\s+)/g, '\\$1');
}
