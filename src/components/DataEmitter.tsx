'use client';
interface DataEmitterProps {
  onData: (data: string) => void;
}

function DataEmitter({ onData }: DataEmitterProps) {
  const dataToSend = 'Data from child';

  const handleClick = () => {
    onData(dataToSend);
  };

  return <button onClick={handleClick}>Emit Data to Parent</button>;
}

export default DataEmitter;
