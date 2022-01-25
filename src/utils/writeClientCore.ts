import { resolve } from 'path';

import type { Client } from '../client/interfaces/Client';
import { HttpClient } from '../HttpClient';
import { Indent } from '../Indent';
import { copyFile, exists, writeFile } from './fileSystem';
import { formatIndentation as i } from './formatIndentation';
import { Templates } from './registerHandlebarTemplates';

/**
 * Generate OpenAPI core files, this includes the basic boilerplate code to handle requests.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param indent: Indentation options (4, 2 or tab)
 * @param request: Path to custom request file
 */
export async function writeClientCore(
    client: Client,
    templates: Templates,
    outputPath: string,
    httpClient: HttpClient,
    indent: Indent,
    request?: string
): Promise<void> {
    const context = {
        httpClient,
        server: client.server,
        version: client.version,
    };

    await writeFile(resolve(outputPath, 'OpenAPI.ts'), i(templates.core.settings(context), indent));
    await writeFile(resolve(outputPath, 'ApiError.ts'), i(templates.core.apiError(context), indent));
    await writeFile(resolve(outputPath, 'ApiRequestOptions.ts'), i(templates.core.apiRequestOptions(context), indent));
    await writeFile(resolve(outputPath, 'ApiResult.ts'), i(templates.core.apiResult(context), indent));
    await writeFile(resolve(outputPath, 'CancelablePromise.ts'), i(templates.core.cancelablePromise(context), indent));
    await writeFile(resolve(outputPath, 'request.ts'), i(templates.core.request(context), indent));

    if (request) {
        const requestFile = resolve(process.cwd(), request);
        const requestFileExists = await exists(requestFile);
        if (!requestFileExists) {
            throw new Error(`Custom request file "${requestFile}" does not exists`);
        }
        await copyFile(requestFile, resolve(outputPath, 'request.ts'));
    }
}
