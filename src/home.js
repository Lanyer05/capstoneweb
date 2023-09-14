import React, { useState, useEffect } from 'react';
import firebase from './config/firebase';
import { useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';
import AnimatedPage from './AnimatedPage';

function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const handleTrigger = () => setIsOpen(!isOpen);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      console.log('Logout successful.');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const messaging = firebase.messaging();

    const checkLoggedInUser = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        try {
          const fcmToken = await messaging.getToken();
          const userRef = firebase.firestore().collection('users').doc(user.uid);
          const batch = firebase.firestore().batch();
          
          if (userRef) {
            batch.update(userRef, {
              fcmToken: fcmToken,
              email: user.email,
              uid: user.uid,
            });
          } else {
            batch.set(userRef, {
              fcmToken: fcmToken,
              email: user.email,
              uid: user.uid,
            });
          }
          
          await batch.commit();
        } catch (error) {
          console.error('Error while retrieving or updating FCM token:', error);
        }
      }
    };
    checkLoggedInUser();
  }, []);

  
  useEffect(() => {
    const requestPermission = () => {
      console.log('Requesting permission...');
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else if (permission === 'denied') {
          console.log('Notification permission denied.');
        } else {
          console.log('Notification permission dismissed.');
        }
      });
    };

    requestPermission();
  }, []);


  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkLoggedInUser = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        setIsLoading(false);
      }
    };

    checkLoggedInUser();
  }, []);

  // State for tracking revealed content of each item
  const [revealedItems, setRevealedItems] = useState({});

  const handleItemClick = (itemId) => {
    setRevealedItems((prevItems) => ({
      ...prevItems,
      [itemId]: !prevItems[itemId], // Toggle the state of the clicked item
    }));
  };

  
  return (
    <AnimatedPage>
      <div className="home-container">
        <Sidebar isOpen={isOpen} handleTrigger={handleTrigger} navigate={navigate} handleLogout={handleLogout} />
        <div className="content">
          <h1 className="card-view">WELCOME TO HOMEPAGE</h1>
          <div className="homepage-container">
            <div className="ui-list">
              <div className="ui-item" onClick={() => handleItemClick('item1')}>
                <h2>Explore Rewards Tab</h2>
                <button className="explore-button" onClick={() => navigate('/reward')}>
                  Explore
                </button>
              </div>
              
              {revealedItems['item1'] && (
                <div className="ui-revealed-content">
                  <p className='text'>The Reward Page functions as a hub where websites intersect user actions and incentives, fostering a symbiotic connection between the platform and its visitors. Rooted in behavioral psychology and gamification principles, its primary role is to incentivize and reward users for desired actions, cultivating a sense of accomplishment and satisfaction. This fuels heightened user engagement and extended session durations, pivotal metrics for optimizing website performance. Moreover, the Reward Page serves as a conduit for data-driven personalization, adapting incentives based on user behaviors and preferences. It visually tracks progress, showcasing users' achievements and earned rewards, stimulating motivation for return visits. Through tiered rewards and loyalty programs, the Reward Page fosters a sense of exclusivity, cultivating brand affinity and recurring site visits. It also functions as a conduit for user-generated content and social sharing, amplifying brand exposure and user acquisition. Seamlessly facilitating the redemption of accrued rewards into tangible benefits, the Reward Page elevates user satisfaction and retention. In summation, the Reward Page stands as a pivotal component of modern website strategies, pivotal in driving user engagement, loyalty, and expansion. Its adept utilization of behavioral dynamics and gamification principles underscores its essentiality in the toolkit of website administrators, a driving force in the ongoing evolution of digital platforms.</p>
                </div>
              )}
            

            <div className="ui-item" onClick={() => handleItemClick('item2')}>
              <h2>Explore Task Tab</h2>
              <button className="explore-button" onClick={() => navigate('/task')}>
                Explore
              </button>
            </div>

            {revealedItems['item2'] && (
              <div className="ui-revealed-content">
                <p className='text'>The provided code establishes a dynamic task management page in a React web application, integrating Firebase for authentication and Firestore for data storage. Users can efficiently oversee tasks, requests, and claims using distinct tabs, each serving specific functions. The core features encompass task management, including the ability to access and manipulate task details, add new tasks through a form, update existing tasks, and delete tasks with a confirmation step. The interface's navigation is facilitated by tabs ("Task," "Request," "Claim"), allowing users to seamlessly transition between different functionalities. The code also ensures user authentication, redirecting unauthenticated users to the login page. The user interface boasts a polished design and utilizes React Toastify to provide informative notifications, enhancing user experience and interaction.</p>
              </div>
            )}

            <div className="ui-item" onClick={() => handleItemClick('item3')}>
              <h2>Explore CCTV Preview Tab</h2>
              <button className="explore-button" onClick={() => navigate('/cctv')}>
                Explore
              </button>
            </div>

            {revealedItems['item3'] && (
              <div className="ui-revealed-content">
                <p className='text'>The Reward Page functions as a hub where websites intersect user actions and incentives, fostering a symbiotic connection between the platform and its visitors. Rooted in behavioral psychology and gamification principles, its primary role is to incentivize and reward users for desired actions, cultivating a sense of accomplishment and satisfaction. This fuels heightened user engagement and extended session durations, pivotal metrics for optimizing website performance. Moreover, the Reward Page serves as a conduit for data-driven personalization, adapting incentives based on user behaviors and preferences. It visually tracks progress, showcasing users' achievements and earned rewards, stimulating motivation for return visits. Through tiered rewards and loyalty programs, the Reward Page fosters a sense of exclusivity, cultivating brand affinity and recurring site visits. It also functions as a conduit for user-generated content and social sharing, amplifying brand exposure and user acquisition. Seamlessly facilitating the redemption of accrued rewards into tangible benefits, the Reward Page elevates user satisfaction and retention. In summation, the Reward Page stands as a pivotal component of modern website strategies, pivotal in driving user engagement, loyalty, and expansion. Its adept utilization of behavioral dynamics and gamification principles underscores its essentiality in the toolkit of website administrators, a driving force in the ongoing evolution of digital platforms.</p>
              </div>
            )}
            
            <div className="ui-item" onClick={() => handleItemClick('item4')}>
              <h2>Explore Users Tab</h2>
              <button className="explore-button" onClick={() => navigate('/user')}>
                Explore
              </button>
            </div>

            {revealedItems['item4'] && (
              <div className="ui-revealed-content">
                <p className='text'>This React web application component serves as a dynamic "User" page, facilitating efficient user management tasks through Firebase authentication and Firestore database integration. The component offers two main tabs: "User Request" enables administrators to review and approve user registration requests, while "User Approved" showcases the list of approved users. Admins can manage user requests by approving them, triggering a confirmation dialog and updating their approval status. Similarly, administrators can delete users from the approved list. The component prioritizes a well-structured UI with intuitive tab navigation, stylish buttons, and React Toastify for informative notifications. Security is ensured through Firebase authentication, preventing unauthorized access and allowing secure logout for administrators.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </AnimatedPage>
  );
}

export default React.memo(Home);