#!/bin/bash

echo "truncate table account_index;" | mysql -u root -Dpolkastats
node /usr/local/polkastats-backend-v2/crawlers/account.js
