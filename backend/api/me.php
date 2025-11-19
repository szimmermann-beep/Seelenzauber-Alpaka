<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Credentials: true');

if (!empty($_SESSION['user'])) {
  echo json_encode(['authenticated' => true, 'user' => $_SESSION['user']]);
} else {
  echo json_encode(['authenticated' => false]);
}
