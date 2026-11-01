# TT Job Portal

## Demo login

The deployed frontend includes a client-side demo account that works without a
database or authentication API:

- Email: `demo@ttjobportal.com`
- Password: `TTDemo@123`

## Authentication setup

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` to your local MongoDB or MongoDB Atlas connection string.
3. Replace `JWT_SECRET` with a long random value.
4. Start the API in one terminal:

```bash
npm run server
```

5. Start the frontend in another terminal:

```bash
npm run dev
```

Open the Vite URL shown in the terminal. Registering a user stores the name, email, password hash, and timestamps in the `users` collection in MongoDB. Plain-text passwords are never stored. The API uses port `5001` because macOS commonly reserves port `5000` for AirPlay Receiver.
