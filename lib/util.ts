import * as core from "@actions/core";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const csvparse = require("csv-parse/lib/sync");

export async function getInputList(
	name: string,
	ignoreComma?: boolean,
): Promise<string[]> {
	const res: Array<string> = [];

	const items = core.getInput(name);
	if (items === "") {
		return res;
	}

	const parsed = await csvparse(items, {
		columns: false,
		relax: true,
		relaxColumnCount: true,
		skipLinesWithEmptyValues: true,
	});

	for (const output of parsed) {
		if (output.length == 1) {
			res.push(output[0]);
			continue;
		} else if (!ignoreComma) {
			res.push(...output);
			continue;
		}
		res.push(output.join(","));
	}

	return res.filter(item => item).map(pat => pat.trim());
}

export function imageName(tags: string): string {
	return /([^:@]*)/.exec(tags[0])[0];
}
