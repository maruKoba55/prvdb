interface GreetingProps {
  name: string;
  message?: string;
}

function Greeting({ name, message = 'Hi!' }: GreetingProps) {
  return (
    <div>
      <h1>
        {message} {name}
      </h1>
      <p>I'm glad to see you here.</p>
    </div>
  );
}

export default Greeting;
