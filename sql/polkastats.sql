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
   session_json MEDIUMTEXT NOT NULL,
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
   PRIMARY KEY ( id )  
);

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
   bio VARCHAR(100) NOT NULL,
   website VARCHAR(100) NOT NULL,
   logo VARCHAR(100) NOT NULL,
   updated_at INT(8) NOT NULL,
   PRIMARY KEY ( id )  
);