import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './css/convo.css';

// Utility function to format date
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (isYesterday) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }
};

function Conversations() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { username } = useParams();

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations/${username}`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();

        if (response.status === 200) {
          setData(jsonData);
        } else if (response.statusText === 'Error Fetching Data, please try again later :-/') {
          console.log(jsonData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const latestItems = data.reverse();

  return (
    <>
      <section className="conversations">
        <div className="items-section">
          <div className="section-header-cnt">
            <h4>Showing All {latestItems.length} Chats</h4>
            <hr align="left" className="section-divider" />
          </div>
          {isLoading ? (
            <div className="convo-skeleton">
                <p>loading your chats...</p>
              <div className="c-skel skel-1 grad-animation"></div>
              <div className="c-skel skel-2 grad-animation"></div>
              <div className="c-skel skel-3 grad-animation"></div>
              <div className="c-skel skel-4 grad-animation"></div>
            </div>
          ) : latestItems.length === 0 ? (
            <div className="no-item-disp">
              <h5>You Have No Conversations</h5>
              <Link to={'/upload'}>
                <button className="cat-cta-up">Sell an Item</button>
              </Link>
            </div>
          ) : (
            <section className="chat-container">
              {latestItems.map((convo) => (
                <Link
                  to={`/chat/${convo.sender_username === username ? convo.recipient_username : convo.sender_username}`}
                  key={convo.id}
                >
                  <div className="convo-cnt">
                    <div className="convo-chat-cnt">
                      <div className="convo-titles">
                        <h3 className="convo-title">
                          {convo.sender_username === username ? convo.recipient_username : convo.sender_username}
                        </h3>
                        <p>{formatDate(convo.timestamp)}</p>
                      </div>
                      <div className="convo-info">
                        <p className={`convo-content ${convo.unseen_count > 0 ? 'green' : ''}`}>{convo.content}</p>
                        {convo.unseen_count > 0 && <p className="unseen-msg">{convo.unseen_count}</p>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          )}
        </div>
      </section>
    </>
  );
}

export default Conversations;
