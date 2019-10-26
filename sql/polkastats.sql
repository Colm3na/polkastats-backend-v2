CREATE DATABASE polkastats;

GRANT ALL PRIVILEGES ON polkastats.* to polkastats@localhost identified by 'polkastats';

USE polkastats;

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