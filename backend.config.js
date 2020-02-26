module.exports = {
  // Enable CORS
  enableCORS: true,
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
    multipleStatements: true,
    charset : "utf8mb4"
  },
}
