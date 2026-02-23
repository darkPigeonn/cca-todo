# Firebase Custom Claims - Dokumentasi

Sistem ini menggunakan Firebase Custom Claims untuk mengelola role dan permissions user secara real-time.

## Setup

### 1. Install Dependencies
```bash
npm install firebase-admin
```

### 2. Konfigurasi Environment Variables

Tambahkan salah satu opsi berikut ke `.env.local`:

**Opsi 1: Service Account JSON (Recommended)**
```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project",...}'
```

**Opsi 2: Individual Credentials**
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Opsi 3: Default Credentials (untuk Firebase Functions/GCP)**
Tidak perlu set environment variables, akan menggunakan default credentials dari GCP.

### 3. Mendapatkan Service Account Key

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project Anda
3. Settings (⚙️) > Project Settings > Service Accounts
4. Klik "Generate New Private Key"
5. Download JSON file
6. Copy isi JSON ke `FIREBASE_SERVICE_ACCOUNT` atau extract individual fields

## API Endpoints

### 1. Set Custom Claims
**POST** `/api/auth/set-claims`

Set custom claims untuk user tertentu.

**Request Body:**
```json
{
  "uid": "user-uid-here",
  "role": "coordinator", // optional, akan diambil dari DB jika tidak disediakan
  "customClaims": { // optional, untuk claims tambahan
    "department": "IT",
    "permissions": ["read", "write"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Custom claims berhasil di-set",
  "uid": "user-uid-here",
  "claims": {
    "role": "coordinator"
  },
  "role": "coordinator"
}
```

### 2. Get Custom Claims
**GET** `/api/auth/set-claims?uid=xxx`

Mendapatkan custom claims user saat ini.

**Response:**
```json
{
  "uid": "user-uid-here",
  "claims": {
    "role": "coordinator"
  },
  "role": "coordinator"
}
```

### 3. Sync Claims dari Database
**POST** `/api/auth/sync-claims?uid=xxx`

Sync custom claims dari MongoDB ke Firebase untuk user tertentu.

**POST** `/api/auth/sync-claims`

Sync custom claims untuk semua user yang sudah linked.

**Response:**
```json
{
  "success": true,
  "message": "Berhasil sync 5 dari 5 users",
  "results": [
    { "uid": "uid1", "role": "coordinator", "status": "success" },
    { "uid": "uid2", "role": "employee", "status": "success" }
  ]
}
```

### 4. Refresh Token
**POST** `/api/auth/refresh-token`

Verify ID token dan return custom claims terbaru.

**Request Body:**
```json
{
  "idToken": "firebase-id-token-here"
}
```

**Response:**
```json
{
  "success": true,
  "uid": "user-uid-here",
  "claims": {
    "role": "coordinator"
  },
  "role": "coordinator",
  "email": "user@example.com"
}
```

## Penggunaan di Client Side

### Membaca Custom Claims

Custom claims otomatis dibaca dari ID token saat:
- User login
- Auth state berubah
- Token di-refresh

Role dari custom claims akan otomatis tersedia di `user.role`:

```typescript
const { user } = useAuth()

if (user?.role === 'coordinator') {
  // Show coordinator features
}
```

### Refresh Token Manual

Jika custom claims di-update di server, user perlu refresh token:

```typescript
import { auth } from '@/src/infrastructure/auth/firebaseConfig'
import { getIdToken } from 'firebase/auth'

// Force refresh token
const user = auth.currentUser
if (user) {
  await user.getIdToken(true) // true = force refresh
}
```

## Workflow

### 1. Set Custom Claims untuk User Baru

```typescript
// Set saat user pertama kali login atau saat role berubah
const response = await fetch('/api/auth/set-claims', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    uid: user.uid,
    role: 'coordinator'
  })
})
```

### 2. Sync Claims dari Database

Jika role di-update di MongoDB, sync ke Firebase:

```typescript
// Sync single user
await fetch('/api/auth/sync-claims?uid=xxx', { method: 'POST' })

// Sync all users
await fetch('/api/auth/sync-claims', { method: 'POST' })
```

### 3. Client Side - Force Refresh

Setelah claims di-set, user perlu refresh token:

```typescript
const user = auth.currentUser
if (user) {
  await user.getIdToken(true)
  // AuthContext akan otomatis update dengan role baru
}
```

## Security Rules

Custom claims bisa digunakan di Firebase Security Rules:

```javascript
// Firestore Rules
match /tasks/{taskId} {
  allow read: if request.auth.token.role == 'coordinator';
  allow write: if request.auth.token.role == 'coordinator';
}
```

## Troubleshooting

### Error: "Firebase Admin SDK initialization failed"

1. Pastikan environment variables sudah di-set dengan benar
2. Check format JSON untuk `FIREBASE_SERVICE_ACCOUNT`
3. Pastikan private key sudah di-escape dengan `\n` untuk newlines

### Custom Claims tidak muncul

1. User perlu logout dan login lagi, atau
2. Force refresh token: `user.getIdToken(true)`
3. Check apakah claims sudah di-set dengan GET `/api/auth/set-claims?uid=xxx`

### Role tidak ter-update

1. Pastikan sudah sync claims: `POST /api/auth/sync-claims?uid=xxx`
2. Force refresh token di client
3. Check MongoDB untuk memastikan role sudah benar

## Best Practices

1. **Sync Claims Setelah Update Role**: Setiap kali role di-update di MongoDB, sync ke Firebase
2. **Refresh Token**: Setelah set/sync claims, user perlu refresh token untuk mendapatkan claims terbaru
3. **Fallback ke Database**: Sistem akan fallback ke role dari database jika custom claims tidak tersedia
4. **Monitor Claims**: Gunakan GET endpoint untuk verify claims sudah di-set dengan benar

