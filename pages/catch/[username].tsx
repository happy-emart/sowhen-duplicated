import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';

interface CatchUsernameProps {
  username: string;
}

export default function CatchUsername({ username }: CatchUsernameProps) {
  return (
    <div>
      <h1>사용자 이름: {username}</h1>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<CatchUsernameProps | { notFound: boolean }> = async (context) => {
  const session = await getSession(context);

  const username = session?.username || 'Non-members';

  return {
    props: {
      username: username as string,
    },
  };
};