Devsecops-Workshop — VM Deployment Guide (Node.js + PM2 + Nginx)
1. Access the VM

What this does: Log into the ESXi Linux VM over SSH so you can run commands on it.

Step #	Task	Command(s)	What it does
1	Find the VM's IP address	From ESXi/vSphere client: select VM → Summary tab → IP Address.
Or, if you already have console access on the VM:
ip a	Confirms the VM's network address before you try to connect to it.
2	SSH into the VM from your PC	ssh youruser@<vm-ip>
	Opens a remote terminal session into the VM so you can run all following commands.
2. Install Prerequisites

What this does: Update the OS and install git, nginx, and Node.js on the VM.

Step #	Task	Command(s)	What it does
3	Update system packages	sudo apt update && sudo apt upgrade -y	Refreshes package lists and applies OS updates.
4	Install git, curl, nginx	sudo apt install -y git curl nginx	Installs the tools needed to clone the repo and serve the app.
5	Add NodeSource repo (Node 20 LTS)	curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -	Adds the official Node.js package source so apt can install a current version.
6	Install Node.js	sudo apt install -y nodejs
node -v
npm -v	Installs Node.js and npm, then confirms the installed versions.
3. Clone the Repository

What this does: Download your app's code from GitHub onto the VM.

Step #	Task	Command(s)	What it does
7	Create app directory & clone repo	cd /var/www
sudo git clone https://github.com/rafay-484/Devsecops-Workshop.git	Copies the GitHub repo onto the VM under /var/www.
8	Fix folder ownership	sudo chown -R $USER:$USER Devsecops-Workshop	Lets your current user edit/run files without needing sudo every time.
9	Move into the app folder	cd Devsecops-Workshop/app	This is where index.js and package.json live — the actual Node app.
4. Install & Test the App

What this does: Install dependencies and confirm the app runs correctly before going further.

Step #	Task	Command(s)	What it does
10	Install dependencies	npm install	Downloads the Node packages the app needs, listed in package.json.
11	Test app runs (foreground)	npm start	Starts the app manually to confirm it works. Should print: [SERVER] Secured App running on port 3000. Ctrl+C to stop.
12	Test locally from a 2nd SSH session	curl http://localhost:3000/api/health	Confirms the app responds on port 3000, while npm start keeps running in the first session.
5. Keep the App Running (PM2)

What this does: Run the app as a background service so it survives SSH disconnects and VM reboots.

Step #	Task	Command(s)	What it does
13	Stop the manual process	Press Ctrl+C in the terminal running npm start	Frees up port 3000 before PM2 takes over managing the app.
14	Install PM2 globally	sudo npm install -g pm2	Installs the process manager that keeps the app alive in the background.
15	Start app under PM2	pm2 start index.js --name devsecops-app	Runs the app as a managed background process, independent of your SSH session.
16	Save the PM2 process list	pm2 save	Remembers which processes PM2 should restore after a reboot.
17	Enable PM2 on system boot	pm2 startup	Prints a sudo command — copy and run that exact line so PM2 auto-starts your app on VM boot.
18	Verify app runs independently	pm2 status
curl http://localhost:3000/api/health	Confirms the app stays up even without an active SSH session. Safe to disconnect after this.
6. Configure Nginx Reverse Proxy

What this does: Set up nginx to forward web traffic from port 80 to the app on port 3000.

Step #	Task	Command(s)	What it does
19	Create nginx site config file	sudo nano /etc/nginx/sites-available/devsecops-app	Opens a new blank config file for this site.
20	Paste config into the file	server {<br>&nbsp;&nbsp;listen 80;<br>&nbsp;&nbsp;server_name <vm-ip>;<br>&nbsp;&nbsp;location / {<br>&nbsp;&nbsp;&nbsp;&nbsp;proxy_pass http://localhost:3000;<br>&nbsp;&nbsp;&nbsp;&nbsp;proxy_http_version 1.1;<br>&nbsp;&nbsp;&nbsp;&nbsp;proxy_set_header Upgrade $http_upgrade;<br>&nbsp;&nbsp;&nbsp;&nbsp;proxy_set_header Connection 'upgrade';<br>&nbsp;&nbsp;&nbsp;&nbsp;proxy_set_header Host $host;<br>&nbsp;&nbsp;&nbsp;&nbsp;proxy_cache_bypass $http_upgrade;<br>&nbsp;&nbsp;&nbsp;&nbsp;proxy_set_header X-Real-IP $remote_addr;<br>&nbsp;&nbsp;&nbsp;&nbsp;proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;<br>&nbsp;&nbsp;&nbsp;&nbsp;proxy_set_header X-Forwarded-Proto $scheme;<br>&nbsp;&nbsp;}<br>}	Tells nginx to forward all requests on port 80 to the Node app on port 3000. Replace <vm-ip> with the real IP, e.g. 192.168.7.233. Save with Ctrl+O, Enter, Ctrl+X.
21	Confirm the file saved correctly	cat /etc/nginx/sites-available/devsecops-app	Checks the config isn't empty before enabling it — prevents the broken-symlink error.
22	Enable the site (create symlink)	sudo ln -s /etc/nginx/sites-available/devsecops-app /etc/nginx/sites-enabled/devsecops-app	Activates the config. Only run after step 21 confirms the file exists.
23	Remove the default nginx site	sudo rm -f /etc/nginx/sites-enabled/default	Avoids a conflict with the default page on port 80.
24	Test nginx config syntax	sudo nginx -t	Validates the config before restarting. Must say syntax is ok / test is successful.
25	Restart & enable nginx	sudo systemctl restart nginx
sudo systemctl enable nginx	Applies the new config and makes nginx start automatically on boot.
26	Confirm nginx is running	sudo systemctl status nginx	Should show active (running) in green.

Full nginx config block (copy-paste ready):

nginx
server {
    listen 80;
    server_name <vm-ip>;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
7. Open the Firewall

What this does: Allow web (port 80/443) and SSH traffic through the VM's firewall.

Step #	Task	Command(s)	What it does
27	Allow HTTP/HTTPS and SSH through ufw	sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH	Opens the ports nginx and SSH need. Skip if ufw isn't enabled on this VM.
8. Verify in Browser

What this does: Confirm the app is reachable from outside the VM via its IP address.

Step #	Task	Command(s)	What it does
28	Get the VM's IP address	ip a	Look for inet under the bridged/VM network adapter (e.g. ens34) — this is the IP you'll browse to.
29	Test locally on the VM through nginx	curl http://localhost	Confirms nginx → Node proxy works before checking from a browser.
30	Open the app in a browser	http://<vm-ip>/	From any machine on the same network as the VM. Replace <vm-ip> with the real address.
9. Troubleshooting

What this does: Quick checks if the site doesn't load or the app doesn't respond.

Step #	Task	Command(s)	What it does
31	Browser shows 'connection refused'	sudo systemctl status nginx
sudo journalctl -xeu nginx.service	Means nginx isn't running — check for config errors first.
32	curl to localhost:3000 fails	pm2 status
pm2 logs devsecops-app	Means the Node app itself isn't running under PM2.
33	Browser can't reach VM at all	ping <vm-ip>	Run from your Windows machine (PowerShell) to confirm basic network reachability to the VM.
