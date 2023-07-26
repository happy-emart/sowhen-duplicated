import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import clientPromise from '../../lib/mongodb';

interface CatchUserProps {
  useremail: string;
  username: string;
  targetUserEmail: string;
  targetUserName: string;
}

interface Params extends ParsedUrlQuery {
  username: string;
}

export default function CatchUsername({ username, useremail, targetUserEmail, targetUserName }: CatchUserProps) {
  const [formVisible, setFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  const handleClick = () => {
    setFormVisible(true);
  };

  const handleSendEmail = async () => {
    const response = await fetch('/api/send_email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email: [useremail, targetUserEmail], note, targetUserName }),
    });

    if (!response.ok) {
      // 에러 처리
      console.error('Email failed to send');
    } else {
      // 성공 시
      setFormVisible(false);
      toast.success("Save complete", {
        autoClose: 3000, // Duration of the toast in milliseconds (e.g., 3000 ms = 3 seconds)
        hideProgressBar: true, // Hide the progress bar
        style: {
          backgroundColor: '#333', // Set the background color of the toast
        },
    });
      setName('');
      setNote('');
    }
  };

  return (
    <div>
      <h1>사용자 이름: {username}</h1>
      <h1>사용자 이메일: {useremail}</h1>
      <h1>사용자 이메일: {targetUserEmail}</h1>
      <h1>사용자 이메일: {targetUserName}</h1>
      <button 
        onClick={handleClick} 
        className="bg-blue-500 hover:bg-blue-700 w-36 h-8 py-1 text-white border rounded-md text-sm transition-all ml-4"
      >
        약속 잡기
      </button>
      {formVisible && (
        <div>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            이름:
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              style={{
                backgroundColor: 'lightgray', 
                border: 'none', 
                padding: '5px', 
                borderRadius: '5px',
                marginTop: '5px'
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            메모:
            <input 
              type="text" 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              style={{
                backgroundColor: 'lightgray', 
                border: 'none', 
                padding: '5px', 
                borderRadius: '5px',
                marginTop: '5px'
              }}
            />
          </label>
          <button 
            onClick={handleSendEmail} 
            className="bg-red-600 hover:bg-white border-red-600 w-36 h-8 py-1 text-white hover:text-black border rounded-md text-sm transition-all ml-4"
            >
            <ToastContainer 
                position="bottom-right" // Position of the toast container
                toastClassName="dark-toast" // Custom CSS class for the toast
            />
            전송
          </button>
        </div>
      )}
    </div>
  );
  
}

export const getServerSideProps: GetServerSideProps<CatchUserProps | { notFound: boolean }> = async (context) => {
  const session = await getSession(context);

  const username = session?.username || 'Non-members';
  const useremail = session?.user?.email;

  const client = await clientPromise;
  await client.connect();
  const collection = client.db('test').collection('users');

  const targetUser = await collection.findOne({ username: (context.params as Params).username });

  if (!targetUser) {
    return {
      notFound: true,
    };
  }

  const targetUserEmail = targetUser.email;
  const targetUserName = targetUser.username;

  return {
    props: {
      username: username as string,
      useremail: useremail as string,
      targetUserEmail: targetUserEmail as string,
      targetUserName: targetUserName as string
    },
  };
};