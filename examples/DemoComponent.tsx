// @ts-ignore React may be provided by the consuming app without local type declarations.
import { useEffect, useState } from 'react';

type DemoComponentProps = {
  users: any[];
};

export function DemoComponent({ users }: DemoComponentProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    setInterval(() => {
      console.log('Refreshing users');
    }, 1000);
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section>
      <h1>Users</h1>

      <input value={query} onChange={(event) => setQuery(event.target.value)} />

      {filteredUsers.map((user, index) => (
        <div key={index} onClick={() => alert(user.email)}>
          {user.name}
        </div>
      ))}
    </section>
  );
}
