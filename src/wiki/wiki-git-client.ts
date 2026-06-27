export interface WikiPage {
  path: string;
  content: string;
}

export class WikiGitClient {
  private owner: string;
  private repo: string;
  private dryRun: boolean;

  constructor(owner: string, repo: string, dryRun = true) {
    this.owner = owner;
    this.repo = repo;
    this.dryRun = dryRun;
  }

  async push(pages: WikiPage[]): Promise<void> {
    if (this.dryRun) {
      console.log(`[wiki:dry-run] Would push ${pages.length} page(s) to ${this.owner}/${this.repo}.wiki:`);
      for (const page of pages) {
        console.log(`  - ${page.path} (${page.content.length} chars)`);
      }
      return;
    }

    console.log('[wiki] Wiki push requires git clone of <repo>.wiki.git — not yet implemented for live mode.');
    console.log('[wiki] Pages available locally in docs/wiki/');
  }
}
