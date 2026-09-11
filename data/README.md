# GitHub Activity

`github-activity.json` is a snapshot of [Iamnotphage's public contribution calendar](https://github.com/users/Iamnotphage/contributions). Counts and intensity levels come directly from GitHub's public profile markup. A contribution is GitHub's contribution metric, not necessarily a commit.

Run `npm run github:refresh` to update the snapshot. `npm run build` also refreshes it before the static export. If GitHub is unavailable, the build retains the saved snapshot. There are no browser requests to GitHub and no credentials required.

The **Deploy to GitHub Pages** workflow refreshes the data and redeploys the site on pushes to `main` and daily at **08:17 Asia/Shanghai (00:17 UTC)**. GitHub may delay scheduled runs. To refresh immediately, open the repository's **Actions → Deploy to GitHub Pages → Run workflow** and select `main`.

Each workflow run fetches the contribution data during `npm run build` and includes it in the deployed static files. Automated refreshes do not commit snapshots back to the repository; the checked-in snapshot remains the fallback for failed fetches. The site continues to run entirely on GitHub Pages.

The parser verifies a complete, consecutive year of dates and checks the sum against GitHub's reported total. If GitHub changes the calendar markup, refreshes fall back to the saved data until the parser is updated.
