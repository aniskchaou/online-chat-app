
const path = require("path");
const pkg = require("../package.json");
const fs = require("fs");
const optimistUsageLength = 98;
const yargs = require("yargs")
const version = pkg.version;
const { PeerServer } = require("../dist/src");
const opts = yargs
  .usage("Usage: $0")
  .wrap(Math.min(optimistUsageLength, yargs.terminalWidth()))
  .options({
    expire_timeout: {
      demandOption: false,
      alias: "t",
      describe: "timeout (milliseconds)",
      default: 5000
    },
    concurrent_limit: {
      demandOption: false,
      alias: "c",
      describe: "concurrent limit",
      default: 5000
    },
    alive_timeout: {
      demandOption: false,
      describe: "broken connection check timeout (milliseconds)",
      default: 60000
    },
    key: {
      demandOption: false,
      alias: "k",
      describe: "connection key",
      default: "peerjs"
    },
    sslkey: {
      demandOption: false,
      describe: "path to SSL key"
    },
    sslcert: {
      demandOption: false,
      describe: "path to SSL certificate"
    },
    port: {
      demandOption: true,
      alias: "p",
      describe: "port"
    },
    path: {
      demandOption: false,
      describe: "custom path",
      default: "/"
    },
    allow_discovery: {
      demandOption: false,
      describe: "allow discovery of peers"
    },
    proxied: {
      demandOption: false,
      describe: "Set true if PeerServer stays behind a reverse proxy",
      default: false
    }
  })
  .boolean("allow_discovery")
  .argv;

process.on("uncaughtException", function (e) {
  console.error("Error: " + e);
});

if (opts.sslkey || opts.sslcert) {
  if (opts.sslkey && opts.sslcert) {
    opts.ssl = {
      key: fs.readFileSync(path.resolve(opts.sslkey)),
      cert: fs.readFileSync(path.resolve(opts.sslcert))
    };

    delete opts.sslkey;
    delete opts.sslcert;
  } else {
    console.error("Warning: PeerServer will not run because either " +
      "the key or the certificate has not been provided.");
    process.exit(1);
  }
}

const userPath = opts.path;
const server = PeerServer(opts, server => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(
    "Started PeerServer on %s, port: %s, path: %s (v. %s)",
    host, port, userPath || "/", version
  );
});

server.on("connection", client => {
  console.log(`Client connected: ${client.getId()}`);
});

server.on("disconnect", client => {
  console.log(`Client disconnected: ${client.getId()}`);
});
