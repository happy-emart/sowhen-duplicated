import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Profile from '@/components/profile';
import Tabs from '@/components/tabs';
import {
  getAllUsers,
  UserProps,
  getUserCount,
  getFirstUser
} from '@/lib/api/user';
import { defaultMetaProps } from '@/components/layout/meta';
import clientPromise from '@/lib/mongodb';

export default function Home({ user }: { user: UserProps }) {
  return (
    <Tabs>
      <Profile user={user} settings={false} />
    </Tabs>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  try {
    await clientPromise;
  } catch (e: any) {
    if (e.code === 'ENOTFOUND') {
      // cluster is still provisioning
      return {
        props: {
          clusterStillProvisioning: true
        }
      };
    } else {
      throw new Error(`Connection limit reached. Please try again later.`);
    }
  }

  const results = await getAllUsers();
  const totalUsers = await getUserCount();
  const firstUser = await getFirstUser();
  console.log(firstUser);
  return {
    props: {
      meta: defaultMetaProps,
      results,
      totalUsers,
      user: firstUser
    }
  };
};
