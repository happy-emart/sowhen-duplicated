import { useRouter } from 'next/router';
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

export const getServerSideProps: GetServerSideProps<CatchUsernameProps> = async (context) => {
  const { username } = context.query;

  return {
    props: {
      username: username as string,
    },
  };
};
