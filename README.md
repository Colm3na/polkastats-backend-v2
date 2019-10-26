# Polkastats backend v2

> Polkadot Kusama network statistics backend

## Build backend (run as root)

``` bash
# Change dir
$ cd /usr/local

# Clone this repo
$ git clone https://github.com/Colm3na/polkastats-backend-v2.git

# Change dir
$ cd polkastats-backend-v2

# Install dependencies
$ npm install

# Serve with nodejs
$ node index.js

# Or start with forever (recommended)
$ forever start /usr/local/polkastats-backend-v2/index.js
```

## Setup backend

You will need a kusama full node listening at localhost:9944. You can setup one following this guide: https://blog.colmenalabs.org/running-polkadot-kusama/

### Setup backend MySQL database

Create database, user, permissions and tables:

``` bash
$ echo sql/polkastats.sql | mysql -u root -p'your_mysql_root_password'
```

### Run crawlers via cron

Add this to your /etc/crontab file:

``` bash
## PolkaStats backend v2 crawlers

* *  * * *   root     node /usr/local/polkastats-backend-v2/crawlers/intention.js
* *  * * *   root     node /usr/local/polkastats-backend-v2/crawlers/validator.js

# Execute every 10s

* *  * * *   root     node /usr/local/polkastats-backend-v2/crawlers/chain.js
* *  * * *   root     sleep 10 && node /usr/local/polkastats-backend-v2/crawlers/chain.js
* *  * * *   root     sleep 20 && node /usr/local/polkastats-backend-v2/crawlers/chain.js
* *  * * *   root     sleep 30 && node /usr/local/polkastats-backend-v2/crawlers/chain.js
* *  * * *   root     sleep 40 && node /usr/local/polkastats-backend-v2/crawlers/chain.js
* *  * * *   root     sleep 50 && node /usr/local/polkastats-backend-v2/crawlers/chain.js

# Execute every 5m

*/5 *  * * *   root     node /usr/local/polkastats-backend-v2/crawlers/intention_bonded.js
*/5 *  * * *   root     node /usr/local/polkastats-backend-v2/crawlers/validator_bonded.js
*/5 *  * * *   root     sleep 25 && node /usr/local/polkastats-backend-v2/crawlers/system.js
```


