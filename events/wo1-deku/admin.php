<?php
// Simple password protection
$password = 'deku2026';
session_start();

if (isset($_POST['password'])) {
    if ($_POST['password'] === $password) {
        $_SESSION['admin_auth'] = true;
    }
}

if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: admin.php');
    exit();
}

if (!isset($_SESSION['admin_auth']) || $_SESSION['admin_auth'] !== true) {
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Admin Login - WO1 Deku Memorial</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .login-box { background: #2d2d2d; padding: 2rem; border-radius: 10px; border: 2px solid #d4af37; }
            h2 { color: #d4af37; margin-bottom: 1rem; }
            input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #d4af37; border-radius: 5px; background: #1a1a1a; color: #fff; }
            button { width: 100%; padding: 12px; background: #d4af37; color: #1a1a1a; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
            button:hover { background: #b8942d; }
        </style>
    </head>
    <body>
        <div class="login-box">
            <h2>Admin Access</h2>
            <form method="POST">
                <input type="password" name="password" placeholder="Enter password" required>
                <button type="submit">Login</button>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit();
}

// Handle CSV Export
if (isset($_GET['export'])) {
    $type = $_GET['export'];
    $file = __DIR__ . '/data/' . $type . '.json';

    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true);

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $type . '_' . date('Y-m-d') . '.csv"');

        $output = fopen('php://output', 'w');

        if (!empty($data)) {
            fputcsv($output, array_keys($data[0]));
            foreach ($data as $row) {
                fputcsv($output, $row);
            }
        }
        fclose($output);
        exit();
    }
}

// Handle delete
if (isset($_GET['delete']) && isset($_GET['type']) && isset($_GET['id'])) {
    $type = $_GET['type'];
    $id = $_GET['id'];
    $file = __DIR__ . '/data/' . $type . '.json';

    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true);
        $data = array_filter($data, function($item) use ($id) {
            return $item['id'] !== $id;
        });
        file_put_contents($file, json_encode(array_values($data), JSON_PRETTY_PRINT));
    }
    header('Location: admin.php');
    exit();
}

// Load data
$tributes = [];
$rsvps = [];

if (file_exists(__DIR__ . '/data/tributes.json')) {
    $tributes = json_decode(file_get_contents(__DIR__ . '/data/tributes.json'), true) ?: [];
}
if (file_exists(__DIR__ . '/data/rsvp.json')) {
    $rsvps = json_decode(file_get_contents(__DIR__ . '/data/rsvp.json'), true) ?: [];
}

// Calculate stats
$totalGuests = array_sum(array_column($rsvps, 'guests'));
$attending = count(array_filter($rsvps, function($r) { return $r['attending'] === 'yes'; }));
?>
<!DOCTYPE html>
<html>
<head>
    <title>Admin Dashboard - WO1 Deku Memorial</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; margin: 0; padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        h1 { color: #d4af37; margin: 0; }
        .logout { color: #d4af37; text-decoration: none; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: #2d2d2d; padding: 1.5rem; border-radius: 10px; text-align: center; border-left: 4px solid #d4af37; }
        .stat-number { font-size: 2rem; color: #d4af37; font-weight: bold; }
        .stat-label { color: #888; font-size: 0.9rem; }
        .section { background: #2d2d2d; border-radius: 10px; padding: 1.5rem; margin-bottom: 2rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
        h2 { color: #d4af37; margin: 0; }
        .btn { padding: 8px 16px; border-radius: 5px; text-decoration: none; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 5px; }
        .btn-export { background: #2d5a2d; color: #fff; }
        .btn-delete { background: #8b0000; color: #fff; font-size: 0.8rem; padding: 4px 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #444; }
        th { background: #1a1a1a; color: #d4af37; }
        tr:hover { background: #363636; }
        .message { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .empty { text-align: center; color: #666; padding: 2rem; }
        @media (max-width: 768px) {
            table { font-size: 0.85rem; }
            th, td { padding: 8px; }
            .message { max-width: 150px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1><i class="fas fa-star"></i> WO1 Deku Memorial - Admin</h1>
        <a href="?logout=1" class="logout"><i class="fas fa-sign-out-alt"></i> Logout</a>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number"><?= count($tributes) ?></div>
            <div class="stat-label">Tributes</div>
        </div>
        <div class="stat-card">
            <div class="stat-number"><?= count($rsvps) ?></div>
            <div class="stat-label">RSVPs</div>
        </div>
        <div class="stat-card">
            <div class="stat-number"><?= $attending ?></div>
            <div class="stat-label">Confirmed Attending</div>
        </div>
        <div class="stat-card">
            <div class="stat-number"><?= $totalGuests ?></div>
            <div class="stat-label">Total Guests</div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h2><i class="fas fa-users"></i> RSVP List</h2>
            <?php if (!empty($rsvps)): ?>
            <a href="?export=rsvp" class="btn btn-export"><i class="fas fa-file-excel"></i> Export to Excel</a>
            <?php endif; ?>
        </div>
        <?php if (empty($rsvps)): ?>
            <p class="empty">No RSVPs yet</p>
        <?php else: ?>
        <div style="overflow-x: auto;">
        <table>
            <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Guests</th>
                <th>Event</th>
                <th>Attending</th>
                <th>Date</th>
                <th>Action</th>
            </tr>
            <?php foreach (array_reverse($rsvps) as $r): ?>
            <tr>
                <td><?= htmlspecialchars($r['name']) ?></td>
                <td><?= htmlspecialchars($r['phone']) ?></td>
                <td><?= htmlspecialchars($r['guests']) ?></td>
                <td><?= htmlspecialchars($r['event']) ?></td>
                <td><?= htmlspecialchars($r['attending']) ?></td>
                <td><?= htmlspecialchars($r['timestamp']) ?></td>
                <td><a href="?delete=1&type=rsvp&id=<?= $r['id'] ?>" class="btn btn-delete" onclick="return confirm('Delete this entry?')"><i class="fas fa-trash"></i></a></td>
            </tr>
            <?php endforeach; ?>
        </table>
        </div>
        <?php endif; ?>
    </div>

    <div class="section">
        <div class="section-header">
            <h2><i class="fas fa-feather-alt"></i> Tributes</h2>
            <?php if (!empty($tributes)): ?>
            <a href="?export=tributes" class="btn btn-export"><i class="fas fa-file-excel"></i> Export to Excel</a>
            <?php endif; ?>
        </div>
        <?php if (empty($tributes)): ?>
            <p class="empty">No tributes yet</p>
        <?php else: ?>
        <div style="overflow-x: auto;">
        <table>
            <tr>
                <th>Name</th>
                <th>Relation</th>
                <th>Message</th>
                <th>Date</th>
                <th>Action</th>
            </tr>
            <?php foreach (array_reverse($tributes) as $t): ?>
            <tr>
                <td><?= htmlspecialchars($t['name']) ?></td>
                <td><?= htmlspecialchars($t['relation']) ?></td>
                <td class="message" title="<?= htmlspecialchars($t['message']) ?>"><?= htmlspecialchars($t['message']) ?></td>
                <td><?= htmlspecialchars($t['timestamp']) ?></td>
                <td><a href="?delete=1&type=tributes&id=<?= $t['id'] ?>" class="btn btn-delete" onclick="return confirm('Delete this entry?')"><i class="fas fa-trash"></i></a></td>
            </tr>
            <?php endforeach; ?>
        </table>
        </div>
        <?php endif; ?>
    </div>
</body>
</html>
