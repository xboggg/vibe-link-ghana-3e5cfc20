<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['type'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing type']);
    exit();
}

$type = $input['type'];
$dataDir = __DIR__ . '/../data/';
$email = 'vibelinkgh@gmail.com';

// Process based on type
if ($type === 'tribute') {
    $data = [
        'id' => uniqid(),
        'name' => htmlspecialchars($input['name'] ?? ''),
        'relation' => htmlspecialchars($input['relation'] ?? ''),
        'message' => htmlspecialchars($input['message'] ?? ''),
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    // Validate
    if (empty($data['name']) || empty($data['message'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Name and message are required']);
        exit();
    }
    
    // Save to file
    $file = $dataDir . 'tributes.json';
    $tributes = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
    $tributes[] = $data;
    file_put_contents($file, json_encode($tributes, JSON_PRETTY_PRINT));
    
    // Send email
    $subject = 'New Tribute - Ex-WO1 Deku Memorial';
    $body = "New tribute received:\n\n";
    $body .= "Name: {$data['name']}\n";
    $body .= "Relation: {$data['relation']}\n";
    $body .= "Message: {$data['message']}\n";
    $body .= "Time: {$data['timestamp']}\n";
    $headers = 'From: noreply@vibelinkgh.com';
    @mail($email, $subject, $body, $headers);
    
    echo json_encode(['success' => true, 'message' => 'Tribute submitted successfully']);
    
} elseif ($type === 'rsvp') {
    $data = [
        'id' => uniqid(),
        'name' => htmlspecialchars($input['name'] ?? ''),
        'phone' => htmlspecialchars($input['phone'] ?? ''),
        'guests' => intval($input['guests'] ?? 1),
        'event' => htmlspecialchars($input['event'] ?? ''),
        'attending' => htmlspecialchars($input['attending'] ?? ''),
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    // Validate
    if (empty($data['name']) || empty($data['phone'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Name and phone are required']);
        exit();
    }
    
    // Save to file
    $file = $dataDir . 'rsvp.json';
    $rsvps = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
    $rsvps[] = $data;
    file_put_contents($file, json_encode($rsvps, JSON_PRETTY_PRINT));
    
    // Send email
    $subject = 'New RSVP - Ex-WO1 Deku Memorial';
    $body = "New RSVP received:\n\n";
    $body .= "Name: {$data['name']}\n";
    $body .= "Phone: {$data['phone']}\n";
    $body .= "Guests: {$data['guests']}\n";
    $body .= "Event: {$data['event']}\n";
    $body .= "Attending: {$data['attending']}\n";
    $body .= "Time: {$data['timestamp']}\n";
    $headers = 'From: noreply@vibelinkgh.com';
    @mail($email, $subject, $body, $headers);
    
    echo json_encode(['success' => true, 'message' => 'RSVP submitted successfully']);
    
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid type']);
}
?>
