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
  const [email, setEmail] = useState(useremail || '');
  const [note, setNote] = useState('');

  const handleClick = () => {
    setFormVisible(true);
  };

  const handleSendEmail = () => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  
    if (!name || (!email && username === 'Non-members')) {
      if (username != 'Non-members') {
        toast.error("Please enter a name.", {
          autoClose: 3000,
          hideProgressBar: true,
          style: {
              backgroundColor: '#333',
              }
          })
        return;
      }
      toast.error("Please enter both your name and email.", {
        autoClose: 3000,
        hideProgressBar: true,
        style: {
            backgroundColor: '#333',
            }
        })
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email.", {
        autoClose: 3000,
        hideProgressBar: true,
        style: {
            backgroundColor: '#333',
            }
        })
      return;
    }

    fetch('/api/send_email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email: [email, targetUserEmail], note, targetUserName }),
    })
    .then(data => {
      console.log(data);
      toast.success("Submit Complete", {
        autoClose: 3000, // Duration of the toast in milliseconds (e.g., 3000 ms = 3 seconds)
        hideProgressBar: true, // Hide the progress bar
        style: {
          backgroundColor: '#333', // Set the background color of the toast
          },
        });
        setName('')
        setNote('')
      }).catch((error) => {
        console.error('Error:', error);
    });
  };

  return (
    <div>
      <h1>Sender 이름: {username}</h1>
      <h1>Sender 이메일: {useremail}</h1>
      <h1>Accepter 이메일: {targetUserEmail}</h1>
      <h1>Accepter 아이디: {targetUserName}</h1>
      <button 
        onClick={handleClick} 
        className="bg-blue-500 hover:bg-blue-700 w-36 h-8 py-1 text-white border rounded-md text-sm transition-all ml-4"
      >
        Make an appointment
      </button>
      {formVisible && (
        <div>
          <label style={{ display: 'block', marginBottom: '10px', marginLeft: '10px' }}>
            Name: 
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
                marginTop: '10px',
                marginLeft: '5px'
              }}
            />
          </label>
          {username === 'Non-members' && (
            <label style={{ display: 'block', marginBottom: '10px', marginLeft: '10px' }}>
              Email: 
              <input 
                type="text" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{
                  backgroundColor: 'lightgray', 
                  border: 'none', 
                  padding: '5px', 
                  borderRadius: '5px',
                  marginTop: '10px',
                  marginLeft: '5px'
                }}
              />
            </label>
          )}
          <label style={{ display: 'block', marginBottom: '10px', marginLeft: '10px' }}>
            Memo: 
            <input 
              type="text" 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              style={{
                backgroundColor: 'lightgray', 
                border: 'none', 
                padding: '5px', 
                borderRadius: '5px',
                marginTop: '5px',
                marginLeft: '5px'
              }}
            />
          </label>
          <button 
            onClick={handleSendEmail}
            className="bg-red-600 hover:bg-white border-red-600 w-36 h-8 py-1 text-white hover:text-black border rounded-md text-sm transition-all ml-4"
            >
            Send
          </button>
          <ToastContainer 
                position="bottom-right" // Position of the toast container
                toastClassName="dark-toast" // Custom CSS class for the toast
            />
        </div>
      )}
    </div>
  );
  
}

export const getServerSideProps: GetServerSideProps<CatchUserProps | { notFound: boolean }> = async (context) => {
  const session = await getSession(context);

  const username = session?.username || 'Non-members';
  const useremail = session?.user?.email || null;

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