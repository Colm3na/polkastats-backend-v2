#!/bin/bash

echo "truncate table account_nickname;" | mysql -u root -Dpolkastats
node /usr/local/polkastats-backend-v2/crawlers/nickname.js
