# Publish these review links on GitHub Pages

You only do **one** setup click. After that, GitHub auto-deploys the site and gives you a permanent link
to paste into the Google Doc.

## Steps (all in the browser — no install)

1. **Create a repo.** Go to https://github.com/new
   - Name it e.g. `grower-circle-review`
   - Set it to **Public**
   - Click **Create repository**

2. **Upload these files.** On the new repo page, click **"uploading an existing file"**, then drag in
   everything from this folder:
   - `index.html`
   - `executive-overview.html`
   - `demo.html`
   - `.nojekyll`
   - the `.github` folder (contains `workflows/deploy.yml`)
   Then click **Commit changes**.
   > Tip: drag the *contents* of this folder (not the folder itself) so `index.html` sits at the repo root.

3. **Turn on Pages (the one click).** Go to **Settings → Pages**, and under **Source** choose
   **GitHub Actions**. That's it.

The deploy workflow runs automatically (watch the **Actions** tab). In ~1 minute your link is live at:

```
https://<your-username>.github.io/grower-circle-review/
```

## Links to paste into the Google Doc

- **Both (landing page):** `https://<your-username>.github.io/grower-circle-review/`
- **Executive Overview:** `https://<your-username>.github.io/grower-circle-review/executive-overview.html`
- **Interactive Demo:** `https://<your-username>.github.io/grower-circle-review/demo.html`

## Updating later
Change a file and upload it again (or push). The workflow redeploys automatically — same link.
