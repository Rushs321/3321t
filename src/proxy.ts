import { Request, Response } from 'express';
import _ from 'lodash';
import superagent from 'superagent';
import { getHeapSpaceStatistics, getHeapStatistics, type HeapInfo } from 'v8';

import { compress } from './compress.js';
import { copyHeaders } from './copyHeaders.js';
import { redirect } from './redirect.js';
import { convertFileSize, logger } from '@energypatrikhu/node-core-utils';

export const proxy = async (request: Request, response: Response) => {
	const headers = {
		..._.pick(request.headers, ['cookie', 'dnt', 'referer']),
		'accept-encoding': '*',
		'user-agent': 'Bandwidth-Hero Compressor',
		'x-forwarded-for': request.headers['x-forwarded-for']?.toString()!,
		'via': '1.1 bandwidth-hero',
		'cache-control':
			'private, no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate, s-maxage=0',
		'pragma': 'no-cache',
		'expires': '0',
		'connection': 'close',
		'vary': '*',
	} satisfies Record<string, string>;

	try {
		const netResponse = await superagent
			.get(request.params.url)
			.set(headers)
			.withCredentials()
			.responseType('arraybuffer')
			.buffer(true);

		const mediaSize = netResponse.body.length;
		const compressedImage = await compress(
			netResponse.body,
			request.params,
		);
		const savedSize = mediaSize - compressedImage.size;

		copyHeaders({ source: netResponse, response });
		response.setHeader('content-encoding', 'identity');
		response.setHeader('content-type', `image/${request.params.format}`);
		response.setHeader('content-length', compressedImage.size);
		response.setHeader('x-original-size', mediaSize);
		response.setHeader('x-bytes-saved', savedSize);
		response.setHeader('connection', 'close');
		response.status(200).send(compressedImage.buffer);

		response.end(() => {
			const memoryData = process.memoryUsage();
			const heapStatistics = getHeapStatistics();
			const heapSpaceStatistics = getHeapSpaceStatistics();

			const heapStats: { [key: string]: string } = {};
			for (const key in memoryData) {
				heapStats[key] = convertFileSize(
					memoryData[<keyof NodeJS.MemoryUsage>key],
				);
			}
			for (const key in heapStatistics) {
				heapStats[key] = convertFileSize(
					heapStatistics[<keyof HeapInfo>key],
				);
			}
			for (const { space_name, space_used_size } of heapSpaceStatistics) {
				heapStats[space_name] = convertFileSize(space_used_size);
			}

			logger(
				'info',
				JSON.stringify(
					{
						worker: process.pid,
						params: {
							...request.params,
							imgQuality: compressedImage.quality,
						},
						headers,
						body: {
							originalSize: convertFileSize(mediaSize),
							compressedSize: convertFileSize(
								compressedImage.size,
							),
							savedSize: convertFileSize(savedSize),
						},
						// heapStats,
					},
					null,
					1,
				).replace(/\"/g, ''),
			);

			response.flushHeaders();
			response.destroy();
			request.drop(Infinity);
			request.destroy();

			netResponse?.body.set([]);
			netResponse?.body.fill(0);
			netResponse!.body = Buffer.alloc(0);
			compressedImage.buffer.set([]);
			compressedImage.buffer.fill(0);
			compressedImage.buffer = Buffer.alloc(0);

			if (gc) gc();
			else if (global.gc) global.gc();
		});
	} catch (reason: any) {
		logger(
			'error',
			JSON.stringify(
				{
					worker: process.pid,
					params: request.params,
					headers,
					body: {
						error: 'Cannot compress! ' + (reason.message ?? reason),
					},
				},
				null,
				1,
			).replace(/\"/g, ''),
		);

		if (gc) gc();
		else if (global.gc) global.gc();

		return redirect({ request, response, params: request.params });
	}
};
