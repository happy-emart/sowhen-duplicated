import Head from 'next/head';

export const defaultMetaProps = {
  title: 'SoWhen',
  description:
    'When hard to make plans with friends, "sowhen" ',
  ogImage: `https://assets.vercel.com/image/upload/v1654626375/twitter-cards/mongo-integration-starter.png`,
  ogUrl: 'https://www.sowhen.site'
};

export interface MetaProps {
  title: string;
  description: string;
  ogUrl: string;
  ogImage: string;
}

export default function Meta({ props = defaultMetaProps }: { props?: MetaProps }) {
  const { title, description, ogUrl, ogImage } = props;
  return (
    <Head>
      <title>{title}</title>
      <link rel="icon" href="/favicon.ico" />
      <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
      <meta name="theme-color" content="#7b46f6" />

      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <meta itemProp="name" content={title} />
      <meta itemProp="description" content={description} />
      <meta itemProp="image" content={ogImage} />
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@Vercel" />
      <meta name="twitter:creator" content="@StevenTey" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Head>
  );
}
