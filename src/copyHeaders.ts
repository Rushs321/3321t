import { Response } from 'express';
import superagent from 'superagent';

export function copyHeaders({ source, response }: { source: superagent.Response; response: Response }) {
	for (const [key, value] of Object.entries(source.headers)) {
		try {
			response.setHeader(key, value?.toString()!);
		} catch (e) {
			console.log(e);
		}
	}
}
