import { Await, Link, getRouteApi } from "@tanstack/react-router";
import { trpc } from "~app/lib/trpc";
import { useSignOut } from "./sign-out";

const routeApi = getRouteApi("/");

export const HomeView = () => {
  const slowData = routeApi.useLoaderData();
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
        <p>Slow Data</p>
        <Await fallback="Loading..." promise={slowData.slow}>
          {(data) => <p>{data}</p>}
        </Await>
      </div>

      <div>
        <button onClick={console.log}>Click Me</button>
      </div>
    </div>
  );
};
