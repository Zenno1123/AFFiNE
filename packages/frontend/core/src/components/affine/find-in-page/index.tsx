import { cmdFind } from '@affine/electron-api';
import type React from 'react';
import { useDeferredValue, useEffect, useState } from 'react';

type Result = {
  requestId: number;
  activeMatchOrdinal: number;
  matches: number;
  finalUpdate: boolean;
};

export const FindInPage: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const deferredSearchText = useDeferredValue(searchText);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'f' && (event.ctrlKey || event.metaKey)) {
        setVisible(true);
        const input = document.getElementById('find-input') as HTMLInputElement;
        input.focus();
        input.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      cmdFind?.stopFindInPage('clearSelection');
      setSearchText('');
    }
  }, [visible]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleResult = (data: Result) => {
    setResult(data);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      cmdFind?.stopFindInPage('clearSelection');
      setSearchText('');
      setResult(null);
      setVisible(false);
    }
    if (event.key === 'Enter') {
      cmdFind?.findInPage(deferredSearchText);
      cmdFind?.onFindInPageResult(handleResult);
    }
  };

  const handleNextClick = () => {
    cmdFind?.findInPage(deferredSearchText, { forward: true });
  };

  const handlePrevClick = () => {
    cmdFind?.findInPage(deferredSearchText, { forward: false });
  };

  return (
    <div
      style={{
        display: visible ? 'flex' : 'none',
        position: 'fixed',
        top: '10px',
        left: '80%',
        transform: 'translateX(-50%)',
        zIndex: 99,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '5px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
      }}
    >
      <input
        id="find-input"
        type="text"
        placeholder="Find in page…"
        value={searchText}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        style={{
          padding: '5px 10px',
          marginRight: '5px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
      {result ? (
        <div>
          {result?.activeMatchOrdinal}/{result?.matches}
        </div>
      ) : null}
      <button
        onClick={handlePrevClick}
        style={{
          cursor: 'pointer',
          padding: '5px 10px',
          backgroundColor: '#007BFF',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Prev
      </button>
      <button
        onClick={handleNextClick}
        style={{
          cursor: 'pointer',
          padding: '5px 10px',
          backgroundColor: '#007BFF',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Next
      </button>
    </div>
  );
};
