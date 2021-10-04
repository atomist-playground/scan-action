import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as stream from "stream";

export async function installSkopeo(): Promise<void> {
	await exec.exec("sudo", ["apt-get", "-y", "update"]);
	await exec.exec("sudo", ["apt-get", "-y", "install", "skopeo"]);
}

export async function inspect(image: string): Promise<string> {
	let stdout = "";

	const cmd = "skopeo";
	const args = ["inspect", `docker://${image}`];

	const outStream = new stream.Writable({
		write(buffer, encoding, next) {
			next();
		},
	});

	const exitCode = await core.group("Cataloging image", async () =>
		exec.exec(cmd, args, {
			outStream,
			listeners: {
				stdout(buffer) {
					stdout += buffer.toString();
				},
				stderr(buffer) {
					core.info(buffer.toString());
				},
				debug(message) {
					core.debug(message);
				},
			},
		}),
	);

	if (exitCode > 0) {
		core.debug(`Skopeo stdout: ${stdout}`);
		throw new Error("An error occurred running Skopeo");
	} else {
		return stdout;
	}
}

export async function config(image: string): Promise<string> {
	let stdout = "";

	const cmd = "skopeo";
	const args = ["inspect", `docker://${image}`, "--config"];

	const outStream = new stream.Writable({
		write(buffer, encoding, next) {
			next();
		},
	});

	const exitCode = await core.group("Cataloging image", async () =>
		exec.exec(cmd, args, {
			outStream,
			listeners: {
				stdout(buffer) {
					stdout += buffer.toString();
				},
				stderr(buffer) {
					core.info(buffer.toString());
				},
				debug(message) {
					core.debug(message);
				},
			},
		}),
	);

	if (exitCode > 0) {
		core.debug(`Skopeo stdout: ${stdout}`);
		throw new Error("An error occurred running Skopeo");
	} else {
		return stdout;
	}
}
