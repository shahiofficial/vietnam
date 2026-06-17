# Kairali Trails — Vietnam Packages

Static brochure site for `vietnam.kairalitrails.com`. Pure HTML/CSS/JS, no build step.
Photos are served from a public Supabase Storage bucket; only the logos live in this repo.

## Structure
- `index.html` — listing page (all 12 packages)
- `<package-slug>/index.html` — one detail page per package
- `assets/` — logos (`kt-white.png`, `kt-dark.png`)
- `SUPABASE-UPLOAD-GUIDE.txt` — every image filename/path to upload to the bucket

## Images (Supabase)
Bucket `vietnam` (public) on `https://btulhnrguotqjkhyeazk.supabase.co`.
Each `<img>` retries jpg/jpeg/png/webp/jfif automatically, then falls back to a
labelled placeholder if nothing is uploaded yet. See the upload guide for exact paths.

## Deploy
Push to GitHub → import the repo in Vercel → add domain `vietnam.kairalitrails.com`.
`index.html` is at the repo root, so no framework/build settings are needed.
