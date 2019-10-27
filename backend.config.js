// Backend port
const backendPort = 8443;

// Local Polkadot Kusama node
const wsProviderUrl = 'ws://127.0.0.1:9944';

// MySQL database connection params
const mysqlConnParams = {
  host: "localhost",
  user: "polkastats",
  password: "polkastats",
  database: "polkastats",
};

// SSL certificate files
const privateKeyFile = '/etc/letsencrypt/live/polkastats.io/privkey.pem';
const certificateFile = '/etc/letsencrypt/live/polkastats.io/cert.pem';
const caFile = '/etc/letsencrypt/live/polkastats.io/chain.pem';
