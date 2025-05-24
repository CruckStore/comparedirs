import React, { useState } from 'react';

type Diff = { line: number; old: string; new: string };
type Result = { file: string; status: string; diffs?: Diff[] };

const App: React.FC = () => {
  const [dir1Handle, setDir1Handle] = useState<FileSystemDirectoryHandle | null>(null);
  const [dir2Handle, setDir2Handle] = useState<FileSystemDirectoryHandle | null>(null);
  const [results, setResults] = useState<Result[]>([]);

  const pickDir = async (setDir: (handle: FileSystemDirectoryHandle) => void) => {
    const handle = await (window as any).showDirectoryPicker();
    setDir(handle);
  };

  const compare = async () => {
    if (!dir1Handle || !dir2Handle) return alert('select folder before compare');

    const res = await fetch('http://localhost:3001/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dir1: (dir1Handle as any).name,
        dir2: (dir2Handle as any).name,
      }),
    });
    const data = await res.json();
    setResults(data);
  };

  return (
    <div className="app">
      <h1>compare dir</h1>
      <div className="inputs">
        <button onClick={() => pickDir(setDir1Handle)}>chose folder 1</button>
        <button onClick={() => pickDir(setDir2Handle)}>chose folder 2</button>
        <button onClick={compare} disabled={!dir1Handle || !dir2Handle}>compare</button>
      </div>
      <div className="results">
        {results.map((r, i) => (
          <div key={i} className={`result ${r.status}`}>
            <strong>{r.status.toUpperCase()} :</strong> {r.file}
            {r.diffs && (
              <pre>
                {r.diffs.map((d, idx) => (
                  <div key={idx}>
                    <span className="diff-line old">- {d.old} (line {d.line})</span>
                    <span className="diff-line new">+ {d.new} (line {d.line})</span>
                  </div>
                ))}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
