const http = require("http");
const crypto = require("crypto");
const { exec } = require("child_process");
const fs = require("fs");

const PORT = 9000;
const SECRET = process.env.WEBHOOK_SECRET || "vibelink-deploy-2024";
const PROJECT_DIR = "/var/www/vibelink-new";
const DEPLOY_DIR = "/var/www/vibelinkgh.com";
const LOG_FILE = "/var/log/vibelink-deploy.log";

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = "[" + timestamp + "] " + msg + "\n";
  console.log(line.trim());
  fs.appendFileSync(LOG_FILE, line);
}

function deploy(callback) {
  const commands = [
    "cd " + PROJECT_DIR,
    "git fetch origin",
    "git reset --hard origin/main",
    "npm install --legacy-peer-deps",
    "npm run build",
    "cp -r " + PROJECT_DIR + "/dist/* " + DEPLOY_DIR + "/"
  ].join(" && ");

  log("Starting deployment...");
  
  exec(commands, { maxBuffer: 50 * 1024 * 1024 }, function(error, stdout, stderr) {
    if (error) {
      log("Deployment FAILED: " + error.message);
      log("stderr: " + stderr);
      callback(false, error.message);
    } else {
      log("Deployment SUCCESS!");
      callback(true, "Deployed successfully");
    }
  });
}

const server = http.createServer(function(req, res) {
  if (req.method === "POST" && req.url === "/webhook") {
    let body = "";
    
    req.on("data", function(chunk) { body += chunk; });
    
    req.on("end", function() {
      try {
        const payload = JSON.parse(body);
        const branch = payload.ref;
        
        if (branch === "refs/heads/main") {
          log("Received push to main");
          res.writeHead(200);
          res.end("Deployment started");
          
          deploy(function(success, msg) {
            log("Deploy result: " + (success ? "OK" : "FAILED"));
          });
        } else {
          log("Ignored push to " + branch);
          res.writeHead(200);
          res.end("Ignored - not main branch");
        }
      } catch (e) {
        log("Parse error: " + e.message);
        res.writeHead(400);
        res.end("Bad request");
      }
    });
  } else if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200);
    res.end("Webhook server running");
  } else if (req.method === "POST" && req.url === "/deploy") {
    log("Manual deployment triggered");
    res.writeHead(200);
    res.end("Manual deployment started");
    deploy(function(success, msg) {
      log("Manual deploy: " + (success ? "OK" : "FAILED"));
    });
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, function() {
  log("Webhook server running on port " + PORT);
});
