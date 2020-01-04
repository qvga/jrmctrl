require('dotenv').config();
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const YAML = require('json-to-pretty-yaml');


spawn();

async function spawn() {

    [...Array(Number(process.env.HELPERS_COUNT))]
        .map((v, idx) => {
            return Number(process.env.POOL_PORT) + idx + 1;
        })
        .forEach((id) => {
            console.log(`starting ${id}`);
            config(id);
            startNode(id);
        })

}


async function startNode(id) {
    const {stdout, stderr} = await exec(`screen -A -m -d -S jormungandr${id} ./jormungandr --config config/${id}.yaml --genesis-block-hash ${process.env.GENESIS}&`);
}

function config(id) {


    let config =

    {
        "log": [
        {
            "format": "plain",
            "level": "info",
            "output": "stderr"
        }
    ],
        "p2p": {
        "topics_of_interest": {
            "blocks": "normal",
            "messages": "low"
        },
        "trusted_peers": [
            {
                "address": "/ip4/52.9.132.248/tcp/3000",
                "id": "671a9e7a5c739532668511bea823f0f5c5557c99b813456c"
            },
            {
                "address": "/ip4/52.8.15.52/tcp/3000",
                "id": "18bf81a75e5b15a49b843a66f61602e14d4261fb5595b5f5"
            },
            {
                "address": "/ip4/13.114.196.228/tcp/3000",
                "id": "7e1020c2e2107a849a8353876d047085f475c9bc646e42e9"
            },
            {
                "address": "/ip4/13.112.181.42/tcp/3000",
                "id": "52762c49a84699d43c96fdfe6de18079fb2512077d6aa5bc"
            },
            {
                "address": "/ip4/3.125.75.156/tcp/3000",
                "id": "22fb117f9f72f38b21bca5c0f069766c0d4327925d967791"
            },
            {
                "address": "/ip4/52.28.91.178/tcp/3000",
                "id": "23b3ca09c644fe8098f64c24d75d9f79c8e058642e63a28c"
            },
            {
                "address": "/ip4/3.124.116.145/tcp/3000",
                "id": "99cb10f53185fbef110472d45a36082905ee12df8a049b74"
            }
        ]
    },
        "rest": {
        "listen": "127.0.0.1:3100"
    }
    };

    let restport = id + 200;
    config.rest.listen = "127.0.0.1:" + restport.toString();
    config.storage = `storage/${id}`;
    config.p2p.public_address = `/ip4/${process.env.PUBLIC_IP}/tcp/${id}`;

    const data = YAML.stringify(config);
    fs.writeFile(`config/${id}.yaml`, data, () => {});

}