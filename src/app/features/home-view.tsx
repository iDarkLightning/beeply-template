import { Link } from "@tanstack/react-router";
import { trpc } from "~app/lib/trpc";
import { useSignOut } from "./sign-out";

export const HomeView = () => {
  const [data] = trpc.queryMe.useSuspenseQuery();

  const signOut = useSignOut();

  return (
    <div>
      <div className="bg-red-200 text-blue-700">Home View</div>
      <p>server: {JSON.stringify(data)}</p>
      {data ? (
        <div>
          <button onClick={() => signOut.mutate()}>Sign Out</button>
        </div>
      ) : (
        <div>
          <Link to="/sign-in">Sign In</Link>
        </div>
      )}
      <div>
        <button onClick={console.log}>Click Me</button>
      </div>
    </div>
  );
};
