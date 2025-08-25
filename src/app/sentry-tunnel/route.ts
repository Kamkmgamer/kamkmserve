import type { NextRequest } from 'next/server';

/**
 * Sentry tunnel route to proxy Sentry requests through your domain
 * This helps bypass ad-blockers that might block direct requests to Sentry
 */
export async function POST(request: NextRequest) {
  try {
    const envelope = await request.text();
    const [firstLine] = envelope.split('\n');
    if (!firstLine) {
      return new Response('Bad Request', { status: 400 });
    }
    const header = JSON.parse(firstLine) as { dsn?: string };
    if (!header?.dsn || typeof header.dsn !== 'string') {
      return new Response('Bad Request', { status: 400 });
    }
    const dsnValue: string = header.dsn; // narrowed to string by the check above
    const dsn = new URL(dsnValue);
    const projectId = dsn.pathname?.replace('/', '');
    // Allow Sentry US and EU ingest domains. You can further restrict this by
    // checking the org/project id if desired.
    const hostname = dsn.hostname;
    const allowedHost =
      hostname.endsWith('ingest.sentry.io') || hostname.endsWith('ingest.de.sentry.io');
    const validProject = typeof projectId === 'string' && /^[0-9]+$/.test(projectId);
    if (!allowedHost || !validProject) {
      return new Response('Bad Request', { status: 400 });
    }

    const upstreamSentryUrl = `https://${dsn.host}/api/${projectId}/envelope/`;
    
    const response = await fetch(upstreamSentryUrl, {
      method: 'POST',
      body: envelope,
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Sentry tunnel error:', error);
    return new Response('Bad Request', { status: 400 });
  }
}
