import * as core from "@actions/core";
import * as fs from "fs-extra";
import fetch from "node-fetch";
import * as util from "util";
import * as zlib from "zlib";

import { createSbom } from "./sbom";

async function run(): Promise<void> {
	try {
		const name = core.getInput("image");
		const url = core.getInput("url");
		//const tags = core.getInput("tags");

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const Docker = require("dockerode");
		const dc = new Docker();
		const c = await dc.getImage(name);

		const inspect = await c.inspect();
		const history = await c.history();
		const sbom = JSON.parse(await createSbom(name));

		const payload = await compress(
			JSON.stringify({
				inspect,
				history,
				sbom,
				event: await fs.readJson(process.env.GITHUB_EVENT_PATH),
				path: "Dockerfile",
			}),
		);

		await fetch(url, { method: "post", compress: true, body: payload });
	} catch (error) {
		core.setFailed(error.message);
	}
}

async function compress(value: string): Promise<string> {
	return (await util.promisify(zlib.deflate)(value)).toString("base64");
}

void run();
