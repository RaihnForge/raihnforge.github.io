/**
 * RaihnForge Dashboard — GitHub API Client
 * Handles auth, caching, and all GitHub Contents API operations.
 */
(function () {
  'use strict';

  const REPO = 'RaihnForge/raihnforge-www';
  const BRANCH = 'main';
  const API = 'https://api.github.com';

  // ETag cache: path → { etag, data }
  const cache = new Map();

  // ── Token management ──────────────────────────────────────────

  function getToken() {
    // 1. Dashboard's own PAT
    var t = localStorage.getItem('raihnforge-dashboard-token');
    if (t) return t;
    // 2. Sveltia CMS token
    try {
      var sv = localStorage.getItem('sveltia-cms-user');
      if (sv) { var o = JSON.parse(sv); if (o.token) return o.token; }
    } catch (e) { /* ignore */ }
    // 3. Netlify CMS token
    try {
      var nc = localStorage.getItem('netlify-cms-user');
      if (nc) { var o2 = JSON.parse(nc); if (o2.token) return o2.token; }
    } catch (e) { /* ignore */ }
    return null;
  }

  function setToken(token) {
    localStorage.setItem('raihnforge-dashboard-token', token);
  }

  function clearToken() {
    localStorage.removeItem('raihnforge-dashboard-token');
  }

  // ── API helpers ───────────────────────────────────────────────

  function headers(token, etag) {
    var h = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': 'token ' + token,
    };
    if (etag) h['If-None-Match'] = etag;
    return h;
  }

  /**
   * GET with ETag caching. Returns { data, fromCache }.
   * On 304 returns cached data. On 404 returns null.
   */
  async function apiGet(path, token) {
    var cached = cache.get(path);
    var etag = cached ? cached.etag : null;
    var res = await fetch(API + path, { headers: headers(token, etag) });

    if (res.status === 304 && cached) {
      return { data: cached.data, fromCache: true };
    }
    if (res.status === 404) {
      return { data: null, fromCache: false };
    }
    if (!res.ok) {
      var body = await res.text();
      throw new Error('GitHub API ' + res.status + ': ' + body);
    }

    var data = await res.json();
    var newEtag = res.headers.get('ETag');
    if (newEtag) {
      cache.set(path, { etag: newEtag, data: data });
    }
    return { data: data, fromCache: false };
  }

  // ── Public API methods ────────────────────────────────────────

  /**
   * Validate token — returns { login, name, avatar_url } or null.
   */
  async function validateToken(token) {
    try {
      var res = await fetch(API + '/user', { headers: headers(token) });
      if (!res.ok) return null;
      var data = await res.json();
      return { login: data.login, name: data.name, avatar_url: data.avatar_url };
    } catch (e) {
      return null;
    }
  }

  /**
   * List directory contents. Returns array of { name, path, sha, type, size }.
   */
  async function listDir(dirPath, token) {
    var apiPath = '/repos/' + REPO + '/contents/' + dirPath + '?ref=' + BRANCH;
    var result = await apiGet(apiPath, token);
    if (!result.data) return [];
    return result.data
      .filter(function (f) { return f.type === 'file' && f.name.endsWith('.md'); })
      .map(function (f) {
        return { name: f.name, path: f.path, sha: f.sha, size: f.size };
      });
  }

  /**
   * Get file content (decoded). Returns { content, sha, path }.
   */
  async function getFile(filePath, token) {
    var apiPath = '/repos/' + REPO + '/contents/' + filePath + '?ref=' + BRANCH;
    var result = await apiGet(apiPath, token);
    if (!result.data) return null;
    var content = decodeBase64(result.data.content);
    return { content: content, sha: result.data.sha, path: result.data.path };
  }

  /**
   * Get multiple files in parallel batches.
   */
  async function getFiles(filePaths, token, batchSize) {
    batchSize = batchSize || 10;
    var results = [];
    for (var i = 0; i < filePaths.length; i += batchSize) {
      var batch = filePaths.slice(i, i + batchSize);
      var batchResults = await Promise.all(
        batch.map(function (p) { return getFile(p, token); })
      );
      results = results.concat(batchResults);
    }
    return results;
  }

  /**
   * Update file content. Returns new sha.
   * On 409 conflict: re-fetches and retries once.
   */
  async function updateFile(filePath, content, sha, message, token) {
    var apiPath = API + '/repos/' + REPO + '/contents/' + filePath;
    var body = {
      message: message,
      content: encodeBase64(content),
      sha: sha,
      branch: BRANCH,
    };

    var res = await fetch(apiPath, {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify(body),
    });

    if (res.status === 409) {
      // Conflict — re-fetch current sha and retry
      var current = await getFile(filePath, token);
      if (!current) throw new Error('File not found on retry: ' + filePath);
      body.sha = current.sha;
      // Re-apply the change to current content if a retryFn is provided
      // For now, just use the content we have
      res = await fetch(apiPath, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify(body),
      });
    }

    if (!res.ok) {
      var errBody = await res.text();
      throw new Error('Update failed ' + res.status + ': ' + errBody);
    }

    var data = await res.json();
    // Invalidate cache for this path
    var cachePath = '/repos/' + REPO + '/contents/' + filePath + '?ref=' + BRANCH;
    cache.delete(cachePath);
    return data.content.sha;
  }

  /**
   * Create a new file. Returns sha.
   */
  async function createFile(filePath, content, message, token) {
    var apiPath = API + '/repos/' + REPO + '/contents/' + filePath;
    var body = {
      message: message,
      content: encodeBase64(content),
      branch: BRANCH,
    };

    var res = await fetch(apiPath, {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      var errBody = await res.text();
      throw new Error('Create failed ' + res.status + ': ' + errBody);
    }

    var data = await res.json();
    return data.content.sha;
  }

  /**
   * Delete a file. Requires current sha.
   */
  async function deleteFile(filePath, sha, message, token) {
    var apiPath = API + '/repos/' + REPO + '/contents/' + filePath;
    var body = {
      message: message,
      sha: sha,
      branch: BRANCH,
    };

    var res = await fetch(apiPath, {
      method: 'DELETE',
      headers: headers(token),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      var errBody = await res.text();
      throw new Error('Delete failed ' + res.status + ': ' + errBody);
    }

    // Invalidate cache
    var cachePath = '/repos/' + REPO + '/contents/' + filePath + '?ref=' + BRANCH;
    cache.delete(cachePath);
  }

  /**
   * Get the tree SHA for the default branch.
   * Returns the SHA string for the commit tree.
   */
  async function getTreeSha(token) {
    var result = await apiGet('/repos/' + REPO + '/branches/' + BRANCH, token);
    if (!result.data) throw new Error('Could not fetch branch info');
    return result.data.commit.commit.tree.sha;
  }

  /**
   * Get the full recursive tree for the repo.
   * Returns array of { path, mode, type, sha, size }.
   */
  async function getFullTree(treeSha, token) {
    var result = await apiGet('/repos/' + REPO + '/git/trees/' + treeSha + '?recursive=1', token);
    if (!result.data) throw new Error('Could not fetch tree');
    return result.data.tree;
  }

  /**
   * Get a blob's content by SHA (decoded from base64).
   * Returns the decoded string content.
   */
  async function getBlob(blobSha, token) {
    var result = await apiGet('/repos/' + REPO + '/git/blobs/' + blobSha, token);
    if (!result.data) return null;
    return decodeBase64(result.data.content);
  }

  /**
   * Check rate limit status.
   */
  async function getRateLimit(token) {
    var res = await fetch(API + '/rate_limit', { headers: headers(token) });
    if (!res.ok) return null;
    var data = await res.json();
    return {
      remaining: data.resources.core.remaining,
      limit: data.resources.core.limit,
      reset: new Date(data.resources.core.reset * 1000),
    };
  }

  // ── Base64 helpers (UTF-8 safe) ───────────────────────────────

  function encodeBase64(str) {
    var bytes = new TextEncoder().encode(str);
    var binary = '';
    for (var i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function decodeBase64(b64) {
    var binary = atob(b64.replace(/\n/g, ''));
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  // ── Export ─────────────────────────────────────────────────────

  window.RFDash = window.RFDash || {};
  window.RFDash.github = {
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    validateToken: validateToken,
    listDir: listDir,
    getFile: getFile,
    getFiles: getFiles,
    updateFile: updateFile,
    createFile: createFile,
    deleteFile: deleteFile,
    getTreeSha: getTreeSha,
    getFullTree: getFullTree,
    getBlob: getBlob,
    getRateLimit: getRateLimit,
    REPO: REPO,
    BRANCH: BRANCH,
  };
})();
