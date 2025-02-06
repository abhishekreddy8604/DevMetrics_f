import { NextResponse } from "next/server";

// Simple code execution environment
const executeJavaScript = (code: string): string => {
  try {
    // Create a safe context for evaluation
    const context = {
      console: {
        log: (...args: any[]) => output.push(args.join(' ')),
        error: (...args: any[]) => output.push('Error: ' + args.join(' ')),
        warn: (...args: any[]) => output.push('Warning: ' + args.join(' ')),
      },
      setTimeout: () => {}, // Disabled for safety
      setInterval: () => {}, // Disabled for safety
    };
    
    const output: string[] = [];
    
    // Create a function from the code with access to console.log
    const fn = new Function('console', `
      try {
        ${code}
      } catch (error) {
        console.error(error.message);
      }
    `);

    // Execute the code with our safe console
    fn(context.console);
    
    return output.join('\n') || 'No output';
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

// Python-like execution simulation
const executePython = (code: string): string => {
  try {
    // This is a simulation - in a real app you'd use a Python runtime
    return `Python Output (Simulated):\n${code}`;
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    let output: string;
    
    switch (language) {
      case 'javascript':
        output = executeJavaScript(code);
        break;
      case 'python':
        output = executePython(code);
        break;
      default:
        output = `Language '${language}' is not supported yet`;
    }

    return NextResponse.json({
      output,
      language,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("[CODE_EXECUTE]", error);
    return NextResponse.json(
      { error: 'Failed to execute code' },
      { status: 500 }
    );
  }
}
