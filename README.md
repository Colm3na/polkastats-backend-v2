# Polkastats backend

> Polkadot network statistics backend

## Build backend (run as root)

``` bash
# Change dir
$ cd /usr/local

# Clone this repo
$ git clone https://github.com/Colm3na/polkastats-backend.git

# Change dir
$ cd polkastats-backend

# Install dependencies
$ npm run install

# Serve with nodejs
$ node index.js

# OR start with forever (recommended)
$ forever start /usr/local/polkastats-backend/index.js
```

## Setup backend

### Setup backend MySQL database

``` bash
$ mysql -u root -p'your_mysql_root_password'
> create database validators;
> use validators;
> CREATE TABLE bonded(  
   id INT NOT NULL AUTO_INCREMENT,
   accountId VARCHAR(50) NOT NULL,
   timestamp INT(8) NOT NULL,  
   amount VARCHAR(50) NOT NULL,
   PRIMARY KEY ( id )  
);
> CREATE TABLE offline (  
   id INT NOT NULL AUTO_INCREMENT,
   accountId VARCHAR(50) NOT NULL,
   blocknumber INT(8) NOT NULL,  
   times INT(8) NOT NULL,
   PRIMARY KEY ( id )  
);
> GRANT ALL PRIVILEGES ON validators.* to stats@localhost identified by 'stats';
```

### Execute backend scripts via cron

Add this to your /etc/crontab file:

``` bash
# PolkaStats backend
*/5 *  * * *   root     node /usr/local/polkastats-backend/stake.js
* *    * * *   root     node /usr/local/polkastats-backend/offline.js
```


