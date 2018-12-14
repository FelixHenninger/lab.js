<!doctype html>
<html>
<head>
  <title>lab.js backend checks</title>
</head>
<body>
<?php
  define('DB_PATH', getcwd() . '/data/data.sqlite');

  echo 'Active PHP version: ' . phpversion() . '<br>';

  $pdo_available = extension_loaded('PDO');
  echo 'PDO database bindings available: ' .
    ($pdo_available ? 'yes' : 'no') .
    '<br>';

  $pdo_sqlite_available = in_array(
    'sqlite',
    PDO::getAvailableDrivers()
  );
  echo 'PDO sqlite binding available: ' .
    ($pdo_sqlite_available ? 'yes' : 'no') .
    '<br>';

  $pdo_sqlite_loaded = extension_loaded('pdo_sqlite');
  echo 'PDO sqlite binding loaded: ' .
    ($pdo_sqlite_loaded ? 'yes' : 'no') .
    '<br>';

  $folder_exists = file_exists('data');
  echo 'Data folder exists: ' .
    ($folder_exists ? 'yes' : 'no') .
    '<br>';

  $folder_writable = is_writable('data');
  echo 'Data folder writable: ' .
    ($folder_writable ? 'yes' : 'no') .
    '<br>';

  if ($folder_writable) {
    $db_exists = file_exists(DB_PATH);
    echo 'Database file exists: ' .
      ($db_exists ? 'yes' : 'no') .
      '<br>';

    $db_writable = is_writable(DB_PATH);
    echo 'Database file writable: ' .
      ($db_writable ? 'yes' : 'no').'<br>';
  }

  $db = NULL;

  echo 'Setting up PDO connection: ';
  try {
    $db = new PDO('sqlite:' . DB_PATH);
  } catch (Exception $e) {
    echo 'exception ' . $e->getMessage() . '<br>';
  } finally {
    if ($db) {
      echo 'success (created database file if not already present)<br>';
    }
  }

  $request_url = 'http' .
    (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 's' : '') .
    '://' . $_SERVER[HTTP_HOST] . $_SERVER[REQUEST_URI];
  $db_url = str_replace(
    basename(__FILE__), // Current filename
    'data/data.sqlite', // Database path
    $request_url
  );

  $request = curl_init($db_url);
  curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($request, CURLOPT_VERBOSE, false);
  $result = curl_exec($request);
  $code = curl_getinfo($request, CURLINFO_HTTP_CODE);

  echo 'Response code trying to access the database from the web ' .
    '(should be 40x or possibly 50x): ' . $code . '<br>';
?>
</body>
</html>
