import * as core from "@actions/core";
import * as github from "@actions/github";
import * as fs from "fs-extra";
import fetch from "node-fetch";
import * as util from "util";
import * as zlib from "zlib";

import { config, inspect } from "./docker";
import { createSbom } from "./sbom";

async function run(): Promise<void> {
	try {
		const name = core.getInput("image") || core.getInput("tags"); // TODO cd only take the first tag
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
				inspect: JSON.parse(await inspect(name)),
				history: JSON.parse(await config(name)),
				sbom: JSON.parse(await createSbom(name)),
				event: await fs.readJson(process.env.GITHUB_EVENT_PATH),
				file: { path: file.path, sha: file.sha },
				tags: core.getInput("tags"),
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
