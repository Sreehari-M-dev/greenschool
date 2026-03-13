1. **Login to Render** (https://render.com)
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository containing the backend code (`server.js`, `package.json`).
4. **Configuration Settings:**
   * **Name:** `green-school-api` (or whatever you like)
   * **Region:** (Pick the closest to you)
   * **Branch:** `main` (or `master`)
   * **Root Directory:** (Leave blank if `server.js` is at the root of the repo)
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
5. **Environment Variables (CRITICAL STEP):**
   Scroll down to specific "Environment Variables" section. You MUST add the secrets from your local `.env` file here, because they are not (and should never be) uploaded to GitHub:
   * **Key:** `MONGODB_URI`
     * **Value:** `mongodb+srv://sreeharimm558_db_user:3AcLVGVUZ0hBCRAD@greenschool.horo3te.mongodb.net/greenschool?retryWrites=true&w=majority`
   * **Key:** `FIREBASE_SERVICE_ACCOUNT`
     * **Value:** `{"type":"service_account","project_id":"greenschool-70619","private_key_id":"b530ae93f4836f8e95edadb3f527f2f884373378","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDcYZLNn7TB5t/+\n/ajZhBdkRw5ZUxCWu5IqJjSo/vIp539+gRuIVyHuc0aDi9ymgpeK9cijTJWp/Fzd\nn3K0RxCelPR1PgvZ8g04Y0Jl1SLCouDYeuUdoHr4esXRCN6Foy3x15/g66sC8H92\ntES8x6eA10I0q/X1yxoAPCSsWKhjZFNK9yEp2WZ6K4Wu7FsiyLVH6bX1Sme5qhjN\nB+Dik6U9IrGClhpQ93Vi4T7FnGkXImiw8t/WAjQzPUNOXeESuNulasU/+Vj+j52i\nnnLf4GGxXOJKa9CwmN6YrHruAwcdlPkAJZrwGLDS+tWss3fdSuCIAZkLjJGJeI4q\nKLKUMSKVAgMBAAECggEAZCH7c21g0oeF+FSl7ysq+7ejZ+erjmlsiLUyUSUBwBN8\n5Oxhp6m7c54yCFw4pfmJRKzXfIc0K3fMdDBaDFqLzRouFsVZ2i22XwwOo7lbYWdj\nVUlFqBf+N7+E+S0X+k2B9zQ7YxWBbsT6jWNsJgBrdcmYvdjyWTtutXOeUCa6X+ni\naHjRWMNj7iJ4c97V+1mPgLsIOzhHBxyyO0bxNscK6RvEv7ZMoNEMxPLl2s/uKXtE\ntus227PExdaj9odL/MOhM32EZg51h8B813mYTgxnl3sFgKzjV8d4LrtuJyL/ME1C\nS17NYwlyErP8znh7zILFbQnUBjDEHS7BZqj/KlteUwKBgQDwKLD300Ifa0xhK123\nk9N9RwVGsWiT1nJpI2S+VX0N1329sUrTT0ndEON5VOcX/nF1YhYGO0VD9Rs0cT/S\nj+4T4bT7bI/m81xUx8slHh8xZwpmpGA/EpE4KueXIohd2ZMfEyZiz0y4eARujb5A\nDxa1ydQD2A119/QERxPVU8FMAwKBgQDq6upZsSETDu/eFn3wuFXY2kYcYN8Ykhod\nD5fO8UbOfGY5lUkxpn7rrpkHIzCrCj6Qe5tdEmrH0F7QwKimezIQ7dWBB3+lkHfR\n4Cf5YAixmsFyI3cAlB1gE7fFioSpPvLDNgzIg27Dh3k0B1xUSI1/+vzH5wFzLo7E\nuNPhXMSvhwKBgGrSvrzNZGkTUhsargn9ICJmV8t1GD5CMgvgKWycHA7vHkglN1I8\nv28slvIeONisXg1HfuJwtMOgn+Q4x5nCWbTQPa9kP7IL57LyV8L/3gIcgjzbus/z\nU1L3iqHoQ13zbIRzAS0MZmTbRaVjOQ/HZmOgDcVT8dDaZNkOQJ0wLxe/AoGBAIK4\nPbezLOhiA2/drC7rJDoLG8Bm1z3g7s8FAkCRWglEh827GIOcVjvnaBfkqQxEIxRa\n89USjoCpnlkjG7WoD/ADqC6ocYs7nLEYvqWxnqTVrJdKzMlxofb4geZWcgOLl6Kw\nzOQ23sfG9tbQ0bvEs5hnnYnPLateWOt2vdBFwty5AoGBAKadxtj9ZujEYC/qYMh2\ntX8Nq39lol7CV1Ixhc+V3yJvH5Dzt1uSf/aayGCTEQtB7HBwMpINznfAhsIDAnVA\nXG8sLnHQgOn23/PiNnnfKHEB3NIEWDcGXb9nbFCHn0OZ7MmToC8/oqoTYR1NWBAN\nVOSvy+vqnK47kTrcxMVoXr5Z\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@greenschool-70619.iam.gserviceaccount.com","client_id":"110349476033444437272","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40greenschool-70619.iam.gserviceaccount.com","universe_domain":"googleapis.com"}`
     * *(Note: Make sure there are NO single quotes around the JSON when pasting directly into Render's dashboard).*
6. Click **Create Web Service**. Wait 2-3 minutes for it to build.
7. Copy the generated URL (e.g., `https://green-school-api-xyz.onrender.com`).
