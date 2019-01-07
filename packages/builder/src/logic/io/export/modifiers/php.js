import { makeDataURI } from '../../../util/dataURI'
import { downloadStatic } from '../index'

const backend_php = `<?php

// Define path for the database file
define('DB_PATH', getcwd() . '/data/data.sqlite');

// Establish a database connection
$db = new PDO('sqlite:' . DB_PATH);

// Throw exceptions when errors occur
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Create table, if necessary
$db->exec(
  'CREATE TABLE IF NOT EXISTS labjs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session TEXT,
    timestamp TEXT,
    url TEXT,
    metadata TEXT,
    data TEXT
  )'
);

// Establish or continue session
session_start([
  'cookie_lifetime' => 86400, // 24 hours
  'cookie_httponly' => true,  // Not accessible via JavaScript
  'read_and_close'  => true,  // Extract information and remove lock
]);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  // Decode transmitted data
  $data = json_decode(file_get_contents('php://input'), true);

  // (Cursory) validity check
  if (is_array($data)) {
    // Setup prepared statement
    $insert =
      'INSERT INTO labjs (session, timestamp, url, metadata, data)
       VALUES (:session, :timestamp, :url, :metadata, :data)';
    $stmt = $db->prepare($insert);

    // Insert data
    $stmt->execute(array(
      ':session' => session_id() ?: 'unknown',
      ':timestamp' => date('c'),
      ':url' => isset($data['url']) ? $data['url'] : 'none',
      ':metadata' => isset($data['metadata']) ? json_encode($data['metadata']) : 'none',
      ':data' => isset($data['data']) ? json_encode($data['data']) : 'none'
    ));

    http_response_code(200);
  } else {
    http_response_code(400);
  }

} else {
  http_response_code(405);
}

?>`

const htaccess = `Deny from all`

const phpBackendStatic = {
  'backend.php': {
    content: makeDataURI(backend_php, 'application/php'),
  },
  'data/.htaccess': {
    content: makeDataURI(htaccess, 'text/plain'),
  },
}

const addTransmitPlugin = (state) => {
  // Add transmit plugin to root component
  state.components.root.plugins = [
    ...state.components.root.plugins,
    { type: 'lab.plugins.Transmit', url: 'backend.php' },
  ]

  return state
}

export default state =>
  downloadStatic(
    state, addTransmitPlugin,
    { additionalFiles: phpBackendStatic }
  )
