import * as exec from "@actions/exec";

export async function installSkopeo(): Promise<void> {
	await exec.exec("sudo", ["apt-get", "-y", "update"]);
	await exec.exec("sudo", ["apt-get", "-y", "install", "skopeo"]);
}
