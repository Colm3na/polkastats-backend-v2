<?php

$mysql_hostname = "localhost";
$mysql_user = "polkastats";
$mysql_password = "polkastats";
$mysql_database = "polkastats";

$mysqli = new mysqli($mysql_hostname, $mysql_user , $mysql_password, $mysql_database);
if ($mysqli->connect_errno) {
  echo "Fallo al conectar a MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}

switch ($_GET["action"]) {
  case "system":
    getSystem();
    break;
  case "chain":
    getChain();
    break;
  case "validators":
    getValidators();
    break;
  case "intentions":
    getIntentions();
    break;
  case "identities":
    getIdentities();
    break;
  case "valgraph":
    getValidatorGraph();
    break;
  case "intgraph":
    getIntentionGraph();
    break;
}

$mysqli->close();

function getSystem() {
  $sql = "SELECT chain, client_name, client_version, timestamp FROM system WHERE 1 ORDER BY id DESC LIMIT 1;"
  if ($result = $mysqli->query($sql)) {
    if ($row = $result->fetch_array(MYSQLI_ASSOC)) {
      header('Content-type: application/json');
      echo json_encode($row[0]);
    }
  }
  $result->close();
}

function getChain() {
  
}

function getValidators() {
  
}

function getIntentions() {
  
}

function getIdentities() {
  
}

function getValidatorGraph() {
  
}

function getIntentionGraph() {
  
}