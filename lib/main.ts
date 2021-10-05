import * as core from "@actions/core";
import * as github from "@actions/github";
import fetch from "node-fetch";
import * as util from "util";
import * as zlib from "zlib";

import { getInputList } from "./util";

async function run(): Promise<void> {
	try {
		const tags = await getInputList("tags");
		const url = core.getInput("url");
		const token = core.getInput("token");
		const dockerfile = core.getInput("dockerfile");

		const octokit = github.getOctokit(token);
		const file = (
			await octokit.rest.repos.getContent({
				repo: github.context.repo.repo,
				owner: github.context.repo.owner,
				path: dockerfile,
				ref: github.context.sha,
			})
		).data as any;

		const payload = await compress(
			JSON.stringify({
				//inspect: JSON.parse(await inspect(tags[0])),
				//history: JSON.parse(await config(tags[0])),
				//sbom: JSON.parse(await createSbom(tags[0])),
				//event: await fs.readJson(process.env.GITHUB_EVENT_PATH),
				file: { path: file.path, sha: file.sha },
				tags,
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
