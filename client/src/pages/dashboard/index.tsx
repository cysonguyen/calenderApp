import Head from "next/head";
import { GetServerSideProps } from "next";

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard - Calendar App</title>
      </Head>
      <div>
        <h1>Welcome to Dashboard</h1>
        <p>This is your main dashboard content.</p>
      </div>
    </>
  );
}

type Repo = {
  name: string;
  stargazers_count: number;
};

export const getServerSideProps = (async () => {
  // Fetch data from external API
  const repo: Repo = {
    name: "Calendar App",
    stargazers_count: 100,
  };

  // Pass data to the page via props
  return { props: { repo } };
}) satisfies GetServerSideProps<{ repo: Repo }>;
