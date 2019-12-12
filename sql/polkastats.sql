CREATE DATABASE polkastats;

GRANT ALL PRIVILEGES ON polkastats.* to polkastats@localhost identified by 'polkastats';

USE polkastats;

CREATE TABLE system (  
   id INT NOT NULL AUTO_INCREMENT,
   chain VARCHAR(50) NOT NULL,
   client_name VARCHAR(50) NOT NULL,
   client_version VARCHAR(50) NOT NULL,
   timestamp INT(8) NOT NULL,
   PRIMARY KEY ( id )  
);

CREATE TABLE chain (  
   id INT NOT NULL AUTO_INCREMENT,
   block_height INT(8) NOT NULL,
   block_height_finalized INT(8) NOT NULL,
   session_json MEDIUMTEXT NOT NULL,
   total_issuance VARCHAR(50) NOT NULL,
   timestamp INT(8) NOT NULL,
   PRIMARY KEY ( id )  
);

CREATE TABLE validator (  
   id INT NOT NULL AUTO_INCREMENT,
   block_height INT(8) NOT NULL,  
   timestamp INT(8) NOT NULL,  
   json MEDIUMTEXT NOT NULL,
   PRIMARY KEY ( id )  
);

CREATE TABLE validator_intention (  
   id INT NOT NULL AUTO_INCREMENT,
   block_height INT(8) NOT NULL,  
   timestamp INT(8) NOT NULL,  
   json MEDIUMTEXT NOT NULL,
   PRIMARY KEY ( id )  
);

CREATE TABLE validator_bonded (  
   id INT NOT NULL AUTO_INCREMENT,
   accountId VARCHAR(50) NOT NULL,
   timestamp INT(8) NOT NULL,  
   amount VARCHAR(50) NOT NULL,
   json MEDIUMTEXT NOT NULL,
   PRIMARY KEY ( id )  
);

ALTER TABLE `validator_bonded` ADD INDEX `accountId` (`accountId`);
ALTER TABLE `validator_bonded` ADD INDEX `timestamp` (`timestamp`);

CREATE TABLE intention_bonded (  
   id INT NOT NULL AUTO_INCREMENT,
   accountId VARCHAR(50) NOT NULL,
   timestamp INT(8) NOT NULL,  
   amount VARCHAR(50) NOT NULL,
   json MEDIUMTEXT NOT NULL,
   PRIMARY KEY ( id )  
);

ALTER TABLE `intention_bonded` ADD INDEX `accountId` (`accountId`);
ALTER TABLE `intention_bonded` ADD INDEX `timestamp` (`timestamp`);

CREATE TABLE validator_offline (  
   id INT NOT NULL AUTO_INCREMENT,
   accountId VARCHAR(50) NOT NULL,
   block_height INT(8) NOT NULL,  
   times INT(8) NOT NULL,
   PRIMARY KEY ( id )  
);

CREATE TABLE keybase_identity (  
   id INT NOT NULL AUTO_INCREMENT,
   stashId VARCHAR(50) NOT NULL,
   username VARCHAR(50) NOT NULL,
   username_cased VARCHAR(50) NOT NULL,
   full_name VARCHAR(100) NOT NULL,
   location VARCHAR(100) NOT NULL,
   bio VARCHAR(200) NOT NULL,
   logo VARCHAR(100) NOT NULL,
   website VARCHAR(100) NOT NULL,
   twitter VARCHAR(100) NOT NULL,
   github VARCHAR(100) NOT NULL, 
   created INT(8) NOT NULL,    
   updated INT(8) NOT NULL,
   PRIMARY KEY ( id )  
);

CREATE TABLE account_nickname (  
   id INT NOT NULL AUTO_INCREMENT,
   accountId VARCHAR(50) NOT NULL,
   nickname VARCHAR(100) NOT NULL,
   PRIMARY KEY ( id )  
);

CREATE TABLE phragmen (  
   id INT NOT NULL AUTO_INCREMENT,
   phragmen_json MEDIUMTEXT NOT NULL,
   timestamp INT(8) NOT NULL,
   PRIMARY KEY ( id )  
);

-- {
--   "parentHash": "0x373c7cd321c027faebd126be7e873a26e8cfc0e16e48806d08c70030a9543aa0",
--   "number": 182472,
--   "stateRoot": "0xe1a9d9a96a9d5af31135c161fe463b794748fcf76aaec561a4c15131714bef53",
--   "extrinsicsRoot": "0x578cb4cce581c3d9fc545d1426eae8f428a9ba67b5330871257622b49f05c885",
--   "digest": {
--     "logs": [
--       "0x06424142453402710000000933a80f00000000",
--       "0x054241424501015ade1786690fd9cf3c1f537184cc3a41cdba9b412e74b4a6c2cfc143a786d35bdf21dc7224eb96b0c55b52af373e2d0b1225680c39abc6934acf016fb853018f"
--     ]
--   }
-- }

CREATE TABLE block (  
   id INT NOT NULL AUTO_INCREMENT,
   parentHash VARCHAR(100) NOT NULL,
   blockNumber BIGINT NOT NULL,
   stateRoot VARCHAR(100) NOT NULL,
   blockDigest MEDIUMTEXT NOT NULL,
   PRIMARY KEY ( id )  
);


CREATE TABLE event (  
   id INT NOT NULL AUTO_INCREMENT,
   blockNumber BIGINT NOT NULL,
   section VARCHAR(100) NOT NULL,
   method VARCHAR(100) NOT NULL,
   phase VARCHAR(100) NOT NULL,
   documentation VARCHAR(200) NOT NULL,
   type VARCHAR(100) NOT NULL,
   data MEDIUMTEXT NOT NULL,
   PRIMARY KEY ( id )  
);



