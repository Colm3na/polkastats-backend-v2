export const backendPort = 8443;
export const wsProviderUrl = 'ws://127.0.0.1:9944';
export const mysqlConnParams = {
  host: "localhost",
  user: "polkastats",
  password: "polkastats",
  database: "polkastats",
};
export const privateKeyFile = '/etc/letsencrypt/live/polkastats.io/privkey.pem';
export const certificateFile = '/etc/letsencrypt/live/polkastats.io/cert.pem';
export const caFile = '/etc/letsencrypt/live/polkastats.io/chain.pem';