import * as core from "@actions/core";
import * as util from "util";
import * as zlib from "zlib";

import { createSbom } from "./sbom";

async function run(): Promise<void> {
	try {
		const name = core.getInput("image");
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const Docker = require("dockerode");
		const dc = new Docker();
		const c = await dc.getImage(name);

		const inspect = await c.inspect();
		const history = await c.history();
		const sbom = await createSbom(name);

		const payload = await compress(
			JSON.stringify({
				inspect,
				history,
				sbom,
			}),
		);

		console.log(payload);
	} catch (error) {
		core.setFailed(error.message);
	}
}

async function compress(value: string): Promise<string> {
	return (await util.promisify(zlib.deflate)(value)).toString("base64");
}

void run();
