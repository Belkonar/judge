import { Injectable } from '@nestjs/common';
import { PolicyRequest } from '../policy-request.interface';
import { exec } from 'child_process';
import * as stream from 'stream';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

// TODO: Make the synced versions of these async

@Injectable()
export class PolicyService {
  async ExecuteOPA(request: PolicyRequest): Promise<unknown> {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bobert'));

    try {
      return await this.RunPolicy(tempDir, request);
    } catch (e) {
      throw e;
    } finally {
      console.log('what');
      await fs.rmSync(tempDir, { recursive: true });
    }
  }

  async RunPolicy(tempDir: string, request: PolicyRequest): Promise<unknown> {
    fs.writeFileSync(path.join(tempDir, 'policy.rego'), request.policy, {
      encoding: 'utf-8',
    });

    return new Promise((resolve, reject) => {
      const process = exec(
        `opa eval --format raw -d policy.rego --stdin-input "${
          request.query || 'data'
        }"`,
        {
          cwd: tempDir,
        },
        (err, stdout, stderr) => {
          if (err) {
            reject(stderr.trim());
          } else {
            resolve(JSON.parse(stdout.trim()).main || {});
          }
        },
      );

      const stdinStream = new stream.Readable();
      stdinStream.push(JSON.stringify(request.data));
      stdinStream.push(null);
      stdinStream.pipe(process.stdin);
    });
  }
}
