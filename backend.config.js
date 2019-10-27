module.exports = {
  // Backend port
  backendPort: 8443,
  // Local Polkadot Kusama node
  wsProviderUrl: 'ws://127.0.0.1:9944',
  // MySQL database connection params
  mysqlConnParams: {
    host: "localhost",
    user: "polkastats",
    password: "polkastats",
    database: "polkastats",
  },
  // SSL certificate files
  privateKeyFile: '/etc/letsencrypt/live/polkastats.io/privkey.pem',
  certificateFile: '/etc/letsencrypt/live/polkastats.io/cert.pem',
  caFile: '/etc/letsencrypt/live/polkastats.io/chain.pem'
}