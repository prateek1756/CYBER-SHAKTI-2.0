# TODO-05 — Add File Upload Size Limits and Type Validation

- **Priority:** 🔴 Critical
- **Status:** [ ] Not Started
- **Files:**
  - `server/src/routes/deepfake.ts`
  - `server/src/routes/mule.ts`

---

## Problem

Both routes use `multer` with `memoryStorage()` and no size limit.
A user can upload a multi-GB file and crash the Node.js process by exhausting RAM.
The mule route also accepts any file type — not just CSV.

```typescript
// CURRENT — no limits, no type check
const upload = multer({ storage: multer.memoryStorage() });
```

---

## Steps to Fix

### deepfake.ts
- [ ] Add `limits: { fileSize: 50 * 1024 * 1024 }` (50MB max for images/videos)
- [ ] Add `fileFilter` to allow only image and video MIME types
- [ ] Return a clear 413 error message when limit is exceeded

### mule.ts
- [ ] Add `limits: { fileSize: 20 * 1024 * 1024 }` (20MB max for CSV)
- [ ] Add `fileFilter` to allow only `.csv` files
- [ ] Return a clear 400 error when a non-CSV file is uploaded

---

## Code to Write

**deepfake.ts:**
```typescript
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    cb(null, ALLOWED_MIME.includes(file.mimetype));
  }
});
```

**mule.ts:**
```typescript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const valid = file.mimetype === 'text/csv' || file.originalname.endsWith('.csv');
    cb(null, valid);
  }
});
```

**Handle multer errors in both routes:**
```typescript
// Add after route definitions
router.use((err: any, _req: any, res: any, next: any) => {
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(413).json({ error: 'File too large.' });
  next(err);
});
```

---

## Done When

- [ ] Uploading a 100MB file to `/api/deepfake/detect` returns 413
- [ ] Uploading a `.txt` file to `/api/mule/upload` returns 400
- [ ] Normal uploads under the size limit still work correctly
