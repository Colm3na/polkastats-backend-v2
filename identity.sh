#!/bin/bash

echo "truncate table keybase_identity;" | mysql -u root -Dpolkastats
node /usr/local/polkastats-backend-v2/crawlers/keybase_identity.js
