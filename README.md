# 🔗 URL Shortener API

A simple and efficient URL Shortener built with **Node.js**, **Express**, **MongoDB**, and **TypeScript**.

## 📦 Features

- Shorten long URLs
- User authentication & association
- Redirect short URLs to original URLs
- Track total clicks & click timestamps
- URL expiration support
- Analytics per user
- Postman Collection included

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/url-shortener.git
cd url-shortener
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/urlshortener
BASE_URL=http://localhost:5000
JWT_SECRET=your_jwt_secret
```

### 4. Start the Server

```bash
npm run dev
```

---

## 🧪 API Endpoints Documentation

All endpoints are prefixed with `/api/url`.

---

### 📌 1. Create a Short URL

**POST** `/api/url/shorten`

#### Request Body

```json
{
  "longUrl": "https://example.com/some/very/long/link",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

> Requires user to be authenticated (JWT token)

#### Response

```json
{
  "shortCode": "abc123",
  "shortUrl": "http://localhost:5000/abc123",
  "longUrl": "https://example.com/some/very/long/link",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

---

### 🔗 2. Redirect to Original URL

**GET** `/:shortCode`

- Redirects the user to the corresponding long URL.
- Increments click count and stores timestamp.
- If expired, returns a 410 Gone error.

---

### 📊 3. Get URL Statistics

**GET** `/api/url/stats/:shortCode`

#### Response

```json
{
  "longUrl": "https://example.com/some/very/long/link",
  "shortCode": "abc123",
  "shortUrl": "http://localhost:5000/abc123",
  "clicks": 10,
  "clickTimestamps": [
    "2025-06-24T10:00:00Z",
    "2025-06-24T11:30:00Z"
  ],
  "createdAt": "2025-06-20T12:00:00Z",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

---

### 📋 4. Get All URLs (for logged-in user)

**GET** `/api/url/all`

> Requires user to be authenticated (JWT token)

#### Response

```json
[
  {
    "shortCode": "abc123",
    "longUrl": "https://example.com",
    "shortUrl": "http://localhost:5000/abc123",
    "clicks": 3,
    "createdAt": "2025-06-20T12:00:00Z",
    "expiresAt": "2025-12-31T23:59:59Z"
  },
  {
    "shortCode": "xyz789",
    "longUrl": "https://google.com",
    "shortUrl": "http://localhost:5000/xyz789",
    "clicks": 5,
    "createdAt": "2025-06-21T09:00:00Z",
    "expiresAt": "2026-01-01T00:00:00Z"
  }
]
```

---

### ❌ 5. Delete a Short URL

**DELETE** `/api/url/:shortCode`

> Requires user to be authenticated (JWT token)

#### Response

```json
{
  "message": "URL deleted successfully"
}
```

---

## 🗄️ MongoDB Schemas

### 📁 URL Schema (`urls` collection)

```ts
{
  _id: ObjectId,
  userId: ObjectId, // Ref to User
  longUrl: string,
  shortCode: string,
  shortUrl: string,
  clicks: number,
  clickTimestamps: Date[], // Each click timestamp
  createdAt: Date,
  expiresAt: Date
}
```

---

### 👤 User Schema (`users` collection)

```ts
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string (hashed),
  createdAt: Date
}
```

---

## 🔐 Authentication

JWT-based authentication. You must pass the token in the `Authorization` header as:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📥 Sample Postman Collection

👉 [Download Postman Collection](https://api.postman.com/collections/40352352-378bf140-0ce2-448d-827b-1da0b0f6fe23?access_key=PMAT-01JYGD334W9MTXS0EE4GGW94A6)  
*(Replace with actual link after exporting Postman collection)*

To export from Postman:
1. Click on your collection → Export
2. Choose v2.1 format
3. Upload it to a cloud service and replace the above link

---

## 🙌 Contributing

1. Fork this repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📃 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

[Rupak Choppala](https://github.com/rupakchoppala)

