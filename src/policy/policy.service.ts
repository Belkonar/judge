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
  async GetKeys(request: PolicyRequest): Promise<string[]> {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'judge'));

    try {
      return (await this.ExecuteOPA(tempDir, request)).main || {};
    } catch (e) {
      throw e;
    } finally {
      await fs.rmSync(tempDir, { recursive: true });
    }
  }

  async GetConfTest(request: PolicyRequest): Promise<string> {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'judge'));

    try {
      return await this.ExecuteConfTest(tempDir, request);
    } catch (e) {
      throw e;
    } finally {
      await fs.rmSync(tempDir, { recursive: true });
    }
  }

  async ExecuteOPA(tempDir: string, request: PolicyRequest): Promise<any> {
    fs.writeFileSync(path.join(tempDir, 'policy.rego'), request.policy, {
      encoding: 'utf-8',
    });

    return new Promise<any>((resolve, reject) => {
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
            resolve(JSON.parse(stdout.trim()));
          }
        },
      );

      const stdinStream = new stream.Readable();
      stdinStream.push(JSON.stringify(request.data));
      stdinStream.push(null);
      stdinStream.pipe(process.stdin);
    });
  }

  async ExecuteConfTest(
    tempDir: string,
    request: PolicyRequest,
  ): Promise<string> {
    fs.writeFileSync(path.join(tempDir, 'policy.rego'), request.policy, {
      encoding: 'utf-8',
    });

    return new Promise<string>((resolve, reject) => {
      const process = exec(
        `conftest test --policy policy.rego -`,
        {
          cwd: tempDir,
        },
        (err, stdout, stderr) => {
          if (err) {
            reject(stdout.trim());
          } else {
            resolve(stdout.trim());
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
