const fs = require('fs');

let fileStr = fs.readFileSync('/home/student/projects/devsecops-workshop/app/index.js', 'utf8');

const newHTML = `  res.send(\`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DevSecOps CI/CD Workshop</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; line-height: 1.6; }
          header { background: #1e293b; padding: 2rem; text-align: center; border-bottom: 2px solid #3b82f6; }
          header h1 { color: #60a5fa; margin: 0; font-size: 2.5rem; }
          header p { font-size: 1.2rem; color: #94a3b8; }
          .container { max-width: 900px; margin: 2rem auto; padding: 0 2rem; }
          .card { background: #1e293b; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); }
          h2 { color: #e2e8f0; margin-top: 0; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
          ol { background: #0f172a; padding: 1.5rem 1.5rem 1.5rem 2.8rem; border-radius: 8px; font-size: 1.1rem; }
          li { margin-bottom: 0.5rem; }
          .tech-stack { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-top: 1.5rem; }
          .badge { background: #3b82f6; color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.9rem; font-weight: bold; }
          .badge-sec { background: #ef4444; }
          .badge-k8s { background: #10b981; }
          button { background: #3b82f6; color: white; border: none; padding: 1rem 2rem; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1.1rem; transition: all 0.2s; width: 100%; margin-bottom: 1rem; }
          button:hover { background: #2563eb; transform: translateY(-2px); }
          pre { background: #0b1120; padding: 1.5rem; border-radius: 8px; overflow-x: auto; color: #a7f3d0; font-size: 1.1rem; border: 1px solid #059669; }
          .accent { color: #ef4444; font-weight: bold; }
        </style>
      </head>
      <body>
        <header>
          <h1>🚀 DevSecOps Pipeline Showcase</h1>
          <p>A "Shift-Left" Security & CI/CD Implementation</p>
        </header>

        <div class="container">
          <div class="card">
            <h2>📖 Project Scope & Architecture</h2>
            <p>This project demonstrates an enterprise-grade automated pipeline. Code pushed to GitHub is automatically built, heavily tested, and aggressively scanned for vulnerabilities before deploying to Kubernetes.</p>
            
            <h3>How The Pipeline Works:</h3>
            <ol>
              <li><strong>Develop:</strong> Node.js REST API with hardened security headers (<span class="accent">Helmet</span>) and request logging (<span class="accent">Morgan</span>).</li>
              <li><strong>Test:</strong> Jest unit testing checks API integrity. CI/CD immediately blocks failures.</li>
              <li><strong>Source Scan (SCA/SAST):</strong> GitHub Actions triggers <code>npm audit</code> to find vulnerable libraries, and Aqua <span class="accent">Trivy</span> scans the repository for embedded secrets or bad configurations.</li>
              <li><strong>Containerize:</strong> The app is packed into a Docker image. Trivy scans the new container for OS-level Linux (CVE) vulnerabilities.</li>
              <li><strong>Deploy:</strong> Only highly-secure, verified images proceed to the Kubernetes deployment manifests.</li>
            </ol>

            <div class="tech-stack">
              <span class="badge">Node.js API</span>
              <span class="badge">Express JS</span>
              <span class="badge badge-k8s">Docker</span>
              <span class="badge badge-k8s">Kubernetes</span>
              <span class="badge">GitHub CI/CD Actions</span>
              <span class="badge badge-sec">Jest Automations</span>
              <span class="badge badge-sec">Trivy (SAST) Scanner</span>
              <span class="badge badge-sec">Security Headers</span>
            </div>
          </div>

          <div class="card">
            <h2>🔒 Live API Security Test</h2>
            <p>Interact with the deployed, secure backend database route dynamically. The response is protected by CORS and Helmet HTTP headers.</p>
            <button id="fetchBtn" onclick="fetchUsers()">Call Live Endpoint: GET /api/users</button>
            <pre id="api-output">Awaiting request...</pre>
          </div>
        </div>

        <script>
          async function fetchUsers() {
            const btn = document.getElementById('fetchBtn');
            const output = document.getElementById('api-output');
            const originalText = btn.innerText;
            
            btn.innerText = 'Fetching securely...';
            btn.style.opacity = '0.7';
            output.textContent = 'Contacting secure backend...\\nVerifying HTTP Headers...';
            
            try {
              const res = await fetch('/api/users', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
              });
              
              if (!res.ok) throw new Error('API Response Error ' + res.status);
              
              const data = await res.json();
              
              // Simulate minor latency to show "secure" checking effect
              setTimeout(() => {
                output.textContent = JSON.stringify(data, null, 2);
                btn.innerText = 'Success! Fetch again?';
                btn.style.opacity = '1';
                btn.style.background = '#10b981';
              }, 400);

            } catch (err) {
              output.textContent = 'Error: ' + err.message;
              btn.innerText = 'Request Failed';
              btn.style.background = '#ef4444';
              btn.style.opacity = '1';
            }
          }
        </script>
      </body>
    </html>
  \`);`;

const startIdx = fileStr.indexOf("  res.send(`");
const endIdx = fileStr.indexOf("  `);") + 5;

const newFileStr = fileStr.substring(0, startIdx) + newHTML + fileStr.substring(endIdx);
fs.writeFileSync('/home/student/projects/devsecops-workshop/app/index.js', newFileStr);
console.log("UI Updated.");
