export interface GitHubWebhookPayload {
    action: string;
    pull_request: PullRequest;
    repository: Repository;
    requested_reviewers: any[]
    _links: any
}

export interface PullRequest {
    id: number;
    number: number;
    title: string;
    state: string;
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
    commits_url: string;
    user: User;
    head: Branch;
}

export interface User {
    login: string;
    avatar_url: string;
}

export interface Branch {
    ref: string;
}

export interface Repository {
    name: string;
    full_name: string;
}