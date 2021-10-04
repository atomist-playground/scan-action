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
		// await installSkopeo();

		const name = core.getInput("image") || core.getInput("tags"); // TODO cd only take the first tag
		const url = core.getInput("url");
		const token = core.getInput("token");
		const dockerfile = core.getInput("dockerfile");
		const slug = process.env.GITHUB_REPOSITORY;

		const octokit = github.getOctokit(token);
		const file = (
			await octokit.rest.repos.getContent({
				repo: slug.split("/")[1],
				owner: slug.split("/")[0],
				path: dockerfile,
				ref: process.env.GITHUB_SHA,
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

		console.log(payload);

		await fetch(url, { method: "post", compress: true, body: payload });
	} catch (error) {
		core.setFailed(error.message);
	}
}

async function compress(value: string): Promise<string> {
	return (await util.promisify(zlib.deflate)(value)).toString("base64");
}

void run();
