# FiveM Anti-Cheat Web Interface

A modern, responsive web dashboard for managing the FiveM Anti-Cheat system.

## Features

- **Real-time Dashboard**: Live statistics and server monitoring
- **Ban Management**: Add, remove, and manage player bans
- **Violation Logs**: View and filter anti-cheat violations
- **Player Monitoring**: Track online players and their status
- **Settings Configuration**: Configure anti-cheat settings
- **Responsive Design**: Works on desktop and mobile devices
- **Secure API**: Rate limiting and security headers

## Quick Start

### Option 1: Simple Python Server (Easiest)

1. Open a terminal in the `web` directory
2. Run: `python -m http.server 8080`
3. Open your browser and go to `http://localhost:8080`

### Option 2: Node.js Server (Recommended for Production)

1. Install Node.js (version 14 or higher)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment file:
   ```bash
   cp .env.example .env
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open your browser and go to `http://localhost:8080`

### Option 3: Development Mode

1. Install nodemon for auto-restart:
   ```bash
   npm install -g nodemon
   ```
2. Run in development mode:
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=8080
NODE_ENV=production
DB_HOST=localhost
DB_USER=root
DB_PASS=password
```

### FiveM Integration

To connect with your FiveM server:

1. Update the API endpoints in `script.js` to point to your server
2. Configure authentication tokens
3. Set up CORS properly

## API Endpoints

The web interface provides these API endpoints:

- `GET /api/statistics` - Get anti-cheat statistics
- `GET /api/bans` - List all bans
- `POST /api/bans` - Create new ban
- `DELETE /api/bans/:id` - Remove ban
- `GET /api/violations` - List violations
- `GET /api/players` - Get online players
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

## Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Controls cross-origin requests
- **Security Headers**: Adds security-related HTTP headers
- **Input Validation**: Validates all incoming data
- **Compression**: Reduces bandwidth usage

## Customization

### Styling

Edit `style.css` to customize the appearance:

```css
:root {
    --primary-color: #e74c3c;
    --secondary-color: #3498db;
    --success-color: #27ae60;
    --warning-color: #f39c12;
    --danger-color: #e74c3c;
}
```

### JavaScript Functionality

The main JavaScript functionality is in `script.js`:

- `AntiCheatDashboard` class manages the interface
- API calls handle server communication
- Real-time updates with auto-refresh
- Modal dialogs for ban management

### Adding New Features

1. Add new API endpoints in `server.js`
2. Update the frontend in `script.js`
3. Add UI elements in `index.html`
4. Style new components in `style.css`

## Deployment

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find process using port 8080
netstat -tulpn | grep :8080
# Kill the process
kill -9 <PID>
```

**CORS errors:**
- Check CORS settings in `server.js`
- Ensure your frontend URL is allowed

**API not responding:**
- Check the server logs
- Verify database connection
- Ensure proper authentication

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

- Check the [main README](../README.md) for full documentation
- Report issues on GitHub
- Join our Discord community

## License

This project is licensed under the MIT License - see the LICENSE file for details.
