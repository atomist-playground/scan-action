import * as core from "@actions/core";

import { executeSyft } from "./sbom";

async function run(): Promise<void> {
	try {
		const name = core.getInput("image");
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const Docker = require("dockerode");
		const dc = new Docker();
		const c = await dc.getImage(name);
		console.log(await c.inspect());
		console.log(await c.history());
		console.log(await executeSyft(name));
	} catch (error) {
		core.setFailed(error.message);
	}
}

void run();
