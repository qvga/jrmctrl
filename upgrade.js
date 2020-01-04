const util = require('util');
const exec = util.promisify(require('child_process').exec);

upgrade();


async function upgrade() {

    let wantedVersion = process.argv.slice(2)[0] || await getLatestVersion();
    let installedVersion = await getInstalledVersion();

    if (wantedVersion !== installedVersion) {
        await wgetAndTarX(await generateAssetUrl(wantedVersion));
        console.log(await getLatestVersion() + " installed.");
    } else {
        console.log(`already wanted version (${wantedVersion})`);
    }

}

async function getLatestVersion() {
    const {stdout, stderr} = await exec('curl -fsSLI -o /dev/null -w %{url_effective} https://github.com/input-output-hk/jormungandr/releases/latest | sed \'s#.*tag/##g\'');
    return stdout;
}

async function getInstalledVersion() {
    try {
        const {stdout, stderr} = await exec(__dirname + '/jormungandr --version');
        return `v${stdout.split("jormungandr").pop().trim()}`;
    } catch (e) {
        console.error(e)
    }

    return 0;
}

async function wgetAndTarX(url) {
    const {stdout, stderr} = await exec(`wget "${url}" -qO- | tar zxv`);
}

async function generateAssetUrl(version) {
    let arch = (await exec('uname -m')).stdout.trim();
    let os = (await exec('uname -s | awk \'{print tolower($0)}\'')).stdout.trim();
    return `https://github.com/input-output-hk/jormungandr/releases/download/${version}/jormungandr-${version}-${arch}-unknown-${os}-gnu.tar.gz`;
}