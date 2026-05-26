import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const OPENCLAW_CMD = '/opt/homebrew/bin/openclaw';
const SESSIONS_DIR = '/Users/adiimathur/.openclaw/agents';
const WORKSPACE_DIR = '/Users/adiimathur/.openclaw/workspace/skills';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const method = searchParams.get('method') || 'health';

  // Handle session history requests
  if (method === 'session.history') {
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Find the session file
    try {
      const sessionFile = join(SESSIONS_DIR, 'main/sessions', `${sessionId}.jsonl`);
      if (!existsSync(sessionFile)) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const content = readFileSync(sessionFile, 'utf8');
      const lines = content.trim().split('\n');

      const messages = [];
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (entry.type === 'message' && entry.message) {
            // Extract text content
            let text = '';
            const content = entry.message.content || [];
            for (const c of content) {
              if (c.type === 'text') {
                text += c.text || '';
              }
            }
            if (text) {
              messages.push({
                role: entry.message.role,
                text: text.trim(),
                timestamp: entry.timestamp ? new Date(entry.timestamp).getTime() : Date.now(),
              });
            }
          }
        } catch (e) {
          // Skip malformed lines
        }
      }

      return NextResponse.json({ messages });
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
  }

  // Handle skills list
  if (method === 'skills.list') {
    try {
      const skillDirs = readdirSync(WORKSPACE_DIR).filter(f => f !== '.DS_Store');
      const skills = skillDirs.map(dir => {
        const skillPath = join(WORKSPACE_DIR, dir, 'SKILL.md');
        let title = dir.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        let description = '';
        let triggerPhrases: string[] = [];

        if (existsSync(skillPath)) {
          const content = readFileSync(skillPath, 'utf8');
          const lines = content.split('\n');

          // Parse frontmatter
          let inFrontmatter = false;
          for (const line of lines) {
            if (line.trim() === '---') {
              if (!inFrontmatter) {
                inFrontmatter = true;
              } else {
                break;
              }
            } else if (inFrontmatter) {
              if (line.startsWith('name:')) {
                title = line.replace('name:', '').trim();
              } else if (line.startsWith('description:')) {
                description = line.replace('description:', '').trim();
              } else if (line.startsWith('trigger phrases:') || line.startsWith('trigger phrases')) {
                const triggers = line.replace(/trigger phrases:?\s*/i, '').split(',').map((t: string) => t.trim().replace(/"/g, ''));
                triggerPhrases = triggers;
              }
            }
          }

          // If no frontmatter description, get first paragraph
          if (!description) {
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('```')) {
                description = trimmed.slice(0, 100);
                break;
              }
            }
          }
        }

        return { name: dir, title, description, triggerPhrases };
      });

      return NextResponse.json({ skills });
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
  }

  // Handle mmx quota
  if (method === 'mmx.quota') {
    try {
      const stdout = execSync('/opt/homebrew/bin/mmx quota show --output json 2>&1', {
        encoding: 'utf8',
        timeout: 15000,
      });

      const jsonStart = stdout.indexOf('{');
      const jsonStr = jsonStart >= 0 ? stdout.substring(jsonStart) : stdout;

      let data;
      try {
        data = JSON.parse(jsonStr);
      } catch {
        data = { raw: stdout, parsed: false };
      }

      return NextResponse.json(data);
    } catch (error) {
      const err = error as Error & { stdout?: string; stderr?: string };
      return NextResponse.json(
        {
          error: err.message,
          stdout: err.stdout?.substring(0, 500),
          stderr: err.stderr?.substring(0, 500)
        },
        { status: 500 }
      );
    }
  }

  try {
    const stdout = execSync(`${OPENCLAW_CMD} gateway call ${method} 2>&1`, {
      encoding: 'utf8',
      timeout: 15000,
    });

    // openclaw outputs "Gateway call: method\n" prefix, then JSON
    const jsonStart = stdout.indexOf('{');
    const jsonStr = jsonStart >= 0 ? stdout.substring(jsonStart) : stdout;

    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch {
      data = { raw: stdout, parsed: false };
    }

    return NextResponse.json(data);
  } catch (error) {
    const err = error as Error & { stdout?: string; stderr?: string };
    return NextResponse.json(
      {
        error: err.message,
        stdout: err.stdout?.substring(0, 500),
        stderr: err.stderr?.substring(0, 500)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { method, params, message, agentId } = body;

    // Handle agent chat messages
    if (method === 'agent.send' || (message && agentId)) {
      const agentMessage = message || params?.message;
      const targetAgent = agentId || params?.agentId || 'main';

      try {
        const stdout = execSync(
          `${OPENCLAW_CMD} agent --agent ${targetAgent} --message "${agentMessage.replace(/"/g, '\\"')}" --json 2>&1`,
          { encoding: 'utf8', timeout: 60000 }
        );

        // Extract JSON from output
        const jsonStart = stdout.indexOf('{');
        const jsonStr = jsonStart >= 0 ? stdout.substring(jsonStart) : stdout;

        let data;
        try {
          data = JSON.parse(jsonStr);
        } catch {
          data = { raw: stdout, text: stdout };
        }

        return NextResponse.json(data);
      } catch (error) {
        const err = error as Error & { stdout?: string; stderr?: string };
        return NextResponse.json(
          { error: err.message, output: err.stdout?.substring(0, 2000) },
          { status: 500 }
        );
      }
    }

    // Handle gateway calls
    if (!method) {
      return NextResponse.json(
        { error: 'Method is required' },
        { status: 400 }
      );
    }

    let cmd = `${OPENCLAW_CMD} gateway call ${method}`;
    if (params) {
      const paramsStr = Object.entries(params)
        .map(([k, v]) => {
          if (typeof v === 'string') return `${k}=${v}`;
          if (typeof v === 'boolean') return v ? `${k}` : '';
          if (v !== null && v !== undefined) return `${k}=${JSON.stringify(v)}`;
          return '';
        })
        .filter(Boolean)
        .join(' ');
      cmd += ` ${paramsStr}`;
    }

    const stdout = execSync(cmd, { encoding: 'utf8', timeout: 30000 });

    const jsonStart = stdout.indexOf('{');
    const jsonStr = jsonStart >= 0 ? stdout.substring(jsonStart) : stdout;

    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch {
      data = { raw: stdout };
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}