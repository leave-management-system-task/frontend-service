# Leave Management System - Frontend

Frontend application for the Leave Management System built with Next.js, React, and TypeScript.

## Features

- **Authentication**: User registration, login, and JWT-based authentication
- **Two-Factor Authentication**: Google Authenticator integration for enhanced security
- **Employee Features**:
  - View leave balance
  - Apply for leave with document upload
  - Track application status
  - View colleagues currently on leave
  - View upcoming public holidays
- **Manager Features**:
  - Approve/reject leave applications
  - View pending approvals
  - Add approval comments
- **Admin/HR Features**:
  - Manage leave types and configurations
  - Adjust employee leave balances
  - Generate and export reports (CSV/Excel)
  - View individual leave calendars

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- Docker (for containerized deployment)
- Backend services running (Authentication Service and Leave Management Service)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:8080/api/auth
NEXT_PUBLIC_LEAVE_SERVICE_URL=http://localhost:8081/api/leave
NEXT_PUBLIC_USERS_SERVICE_URL=http://localhost:8080/api/users
PORT=3000
```

See `.env.example` for reference.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file with your backend service URLs

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
npm run build
npm start
```

## Docker Deployment

### Build Docker Image

```bash
docker build -t lms-frontend:latest .
```

### Run Docker Container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_AUTH_SERVICE_URL=http://your-auth-service-url/api/auth \
  -e NEXT_PUBLIC_LEAVE_SERVICE_URL=http://your-leave-service-url/api/leave \
  -e NEXT_PUBLIC_USERS_SERVICE_URL=http://your-users-service-url/api/users \
  lms-frontend:latest
```

### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: "3.8"

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_AUTH_SERVICE_URL=http://auth-service:8080/api/auth
      - NEXT_PUBLIC_LEAVE_SERVICE_URL=http://leave-service:8081/api/leave
      - NEXT_PUBLIC_USERS_SERVICE_URL=http://auth-service:8080/api/users
    depends_on:
      - auth-service
      - leave-service
```

Then run:

```bash
docker-compose up -d
```

## Testing Instructions

### Manual Testing

1. **Authentication**:
   - Register a new user
   - Login with credentials
   - Enable 2FA in settings
   - Login with 2FA code

2. **Employee Functions**:
   - View leave balance on dashboard
   - Apply for leave (test different leave types)
   - Upload documents if required
   - View application status
   - Check colleagues on leave
   - View upcoming holidays

3. **Manager Functions**:
   - View pending approvals
   - Approve/reject applications
   - Add comments

4. **Admin Functions**:
   - Create/edit/delete leave types
   - Adjust employee leave balances
   - Generate reports

### API Integration Testing

Ensure backend services are running and accessible:

- Authentication Service: `http://localhost:8080`
- Leave Management Service: `http://localhost:8081`

Test API endpoints through the UI or use tools like Postman.

## Project Structure

```
lms-frontend/
├── app/                    # Next.js app directory
│   ├── admin/              # Admin pages
│   ├── dashboard/          # Dashboard page
│   ├── leave/              # Leave management pages
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── settings/           # Settings page
├── components/             # React components
│   ├── Admin/              # Admin components
│   ├── Auth/               # Authentication components
│   ├── Dashboard/          # Dashboard components
│   ├── Layout/             # Layout components
│   └── Leave/              # Leave management components
├── context/                # React context providers
├── lib/                    # API services
│   └── api/                # API client services
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
├── Dockerfile              # Docker configuration
└── package.json            # Dependencies
```

## Technologies Used

- **Next.js 16**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React Hook Form**: Form management
- **Axios**: HTTP client
- **React Hot Toast**: Notifications
- **Date-fns**: Date utilities
- **QRCode React**: 2FA QR code generation
- **XLSX**: Excel export functionality

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Build Issues

If you encounter build issues:

1. Clear `.next` directory: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check Node.js version: `node --version` (should be 20+)

### Docker Issues

If Docker build fails:

1. Ensure Docker is running
2. Check Dockerfile syntax
3. Verify all files are copied correctly
4. Check for platform-specific issues (use `--platform linux/amd64` for Apple Silicon)

### API Connection Issues

1. Verify backend services are running
2. Check environment variables
3. Verify CORS settings on backend
4. Check network connectivity

## Apple Silicon (Mac) Compatibility

The Docker image is built to work on Apple Silicon. If you encounter issues:

1. Build with platform specification:

```bash
docker build --platform linux/amd64 -t lms-frontend:latest .
```

2. Or use Docker's buildx for multi-platform:

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t lms-frontend:latest .
```

## License

This project is part of the Leave Management System for SheCanCode School.
