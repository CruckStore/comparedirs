import React, { useState } from 'react';

type Diff = { line: number; old: string; new: string };
type Result = { file: string; status: string; diffs?: Diff[] };

const App: React.FC = () => {
  const [dir1, setDir1] = useState('');
  const [dir2, setDir2] = useState('');
  const [results, setResults] = useState<Result[]>([]);

  const compare = async () => {
    const res = await fetch('http://localhost:3001/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dir1, dir2 }),
    });
    const data = await res.json();
    setResults(data);
  };

  return (
    <div className="app">
      <h1>comparedir</h1>
      <div className="inputs">
        <input type="text" placeholder="path 1" value={dir1} onChange={e => setDir1(e.target.value)} />
        <input type="text" placeholder="path 2" value={dir2} onChange={e => setDir2(e.target.value)} />
        <button onClick={compare}>compare folder</button>
      </div>
      <div className="results">
        {results.map((r, i) => (
          <div key={i} className={`result ${r.status}`}>
            <strong>{r.status.toUpperCase()} :</strong> {r.file}
            {r.diffs && (
              <pre>
                {r.diffs.map((d, idx) => (
                  <div key={idx}>
                    line {d.line} :
                    <br />- {d.old}
                    <br />+ {d.new}
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
