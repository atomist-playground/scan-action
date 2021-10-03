import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as cache from "@actions/tool-cache";
import * as stream from "stream";

export async function createSbom(image: string): Promise<string> {
	let stdout = "";

	const cmd = await getSyftCommand();

	const env: { [key: string]: string } = {
		SYFT_CHECK_FOR_APP_UPDATE: "false",
	};

	const args = [image, "-o", "json"];

	core.info(`[command]${cmd} ${args.join(" ")}`);

	const outStream = new stream.Writable({
		write(buffer, encoding, next) {
			next();
		},
	});

	const exitCode = await core.group("Executing Syft...", async () =>
		exec.exec(cmd, args, {
			env,
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
		core.debug(`Syft stdout: ${stdout}`);
		throw new Error("An error occurred running Syft");
	} else {
		return stdout;
	}
}

export const SYFT_BINARY_NAME = "syft";
export const SYFT_VERSION = "v0.21.0";

/**
 * Downloads the appropriate Syft binary for the platform
 */
export async function downloadSyft(): Promise<string> {
	const name = SYFT_BINARY_NAME;
	const version = SYFT_VERSION;

	const url = `https://raw.githubusercontent.com/anchore/${name}/main/install.sh`;

	core.debug(`Installing ${name} ${version}`);

	// Download the installer, and run
	const installPath = await cache.downloadTool(url);

	// Make sure the tool's executable bit is set
	await exec.exec(`chmod +x ${installPath}`);

	const cmd = `${installPath} -b ${installPath}_${name} ${version}`;
	await exec.exec(cmd);

	return `${installPath}_${name}/${name}`;
}

/**
 * Gets the Syft command to run via exec
 */
export async function getSyftCommand(): Promise<string> {
	const name = SYFT_BINARY_NAME;
	const version = SYFT_VERSION;

	let syftPath = cache.find(name, version);
	if (!syftPath) {
		// Not found; download and install it; returns a path to the binary
		syftPath = await downloadSyft();

		// Cache the downloaded file
		syftPath = await cache.cacheFile(syftPath, name, name, version);
	}

	core.debug(`Got Syft path: ${syftPath} binary at: ${syftPath}/${name}`);

	// Add tool to path for this and future actions to use
	core.addPath(syftPath);
	return name;
}
