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

### Setup backend MySQL database

Create database, user and tables:

``` bash
$ echo sql/polkastats.sql | mysql -u root -p'your_mysql_root_password'
```

### Execute crawlers via cron

Add this to your /etc/crontab file:

``` bash
# PolkaStats backend v2
* *  * * *   root     node /usr/local/polkastats-backend-v2/crawlers/intention.js
* *  * * *   root     node /usr/local/polkastats-backend-v2/crawlers/validator.js
*/5 *  * * *   root     node /usr/local/polkastats-backend-v2/crawlers/intention_bonded.js
*/5 *  * * *   root     node /usr/local/polkastats-backend-v2/crawlers/validator_bonded.js
*/5 *  * * *   root     node /usr/local/polkastats-backend-v2/crawlers/system.js
```


