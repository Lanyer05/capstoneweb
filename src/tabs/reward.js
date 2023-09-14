  import React, { useState, useEffect, useRef } from "react";
  import firebase from '../config/firebase';
  import { useNavigate } from 'react-router-dom';
  import "../css/Home.css";
  import Sidebar from "../sidebar";
  import { toast, ToastContainer } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
  import { firestore } from "../config/firebase";
  import AnimatedPage from "../AnimatedPage";

  function Reward() {
    const [isOpen, setIsOpen] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const handleTrigger = () => setIsOpen(!isOpen);
    const navigate = useNavigate();
    const [emptyFieldWarning, setEmptyFieldWarning] = useState(false);
    const [rewardName, setRewardName] = useState("");
    const [points, setPoints] = useState("");
    const [rewardsList, setRewardsList] = useState([]);
    const [selectedRewardId, setSelectedRewardId] = useState(null);
    const formContainerRef = useRef(null);
    const [showDeleteButtonId, setShowDeleteButtonId] = useState(null);
    const [updatedRewardName, setUpdatedRewardName] = useState("");
    const [updatedRewardPoints, setUpdatedRewardPoints] = useState("");
    const [updatingRewardId, setUpdatingRewardId] = useState(null);
    const [selectedTab, setSelectedTab] = useState("REWARD");
    const rewardsCollectionRef = firestore.collection("rewards");
    const [requestsList, setRequestsList] = useState([]);
    const [completeRequestsList, setCompleteRequestsList] = useState([]);
    const [selectedClaimTab, setSelectedClaimTab] = useState('CLAIMABLE');
    const [claimableItems, setClaimableItems] = useState([]);
    const [doneClaimedItems, setdoneClaimedItems] = useState([]);
    

    useEffect(() => {
      const handleClickOutsideForm = (event) => {
        if (formContainerRef.current && !formContainerRef.current.contains(event.target)) {
          if (showAddForm) {
            setShowAddForm(false);
          }
          if (updatingRewardId !== null) {
            setUpdatingRewardId(null);
          }
        }
      };
      document.addEventListener("click", handleClickOutsideForm);
      return () => {
        document.removeEventListener("click", handleClickOutsideForm);
      };
    }, [showAddForm, updatingRewardId]);

    useEffect(() => {
      const checkLoggedInUser = async () => {
        const user = firebase.auth().currentUser;
        if (!user) {
          toast.error('Please login to access the rewards page.', { autoClose: 1500, hideProgressBar: true });
          navigate('/login');
        }
      };
      checkLoggedInUser();
    }, [navigate]);

    useEffect(() => {
      const unsubscribeRewards = rewardsCollectionRef.onSnapshot((snapshot) => {
        const rewardsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRewardsList(rewardsData);
      });
    
      return () => {
        unsubscribeRewards();
      };
    }, []);


    const handleAddReward = async () => {
      if (!rewardName || !points) {
        setEmptyFieldWarning(true);
        toast.error('Please fill in both Reward and Points.', { autoClose: 1500, hideProgressBar: true });
        return;
      }

      try {
        const newReward = {
          rewardName: rewardName,
          points: points
        };

        const batch = firestore.batch();

        const newRewardRef = rewardsCollectionRef.doc();
        batch.set(newRewardRef, newReward);

        await batch.commit();

        setRewardsList([...rewardsList, { ...newReward, id: newRewardRef.id }]);
        setRewardName("");
        setPoints("");
        setEmptyFieldWarning(false);
        toast.success('Reward added successfully!', { autoClose: 1500, hideProgressBar: true });
      } catch (error) {
        console.error("Error adding reward:", error);
        toast.error('Failed to add reward.', { autoClose: 1500, hideProgressBar: true });
      }
    };

    const handleDeleteReward = async (id) => {
      try {
        const shouldDelete = window.confirm('Are you sure you want to delete this reward?');
        if (!shouldDelete) {
          return;
        }
    
        const batch = firestore.batch();
    
        const rewardRef = rewardsCollectionRef.doc(id);
        batch.delete(rewardRef);
    
        await batch.commit();
    
        const updatedRewardsList = rewardsList.filter((reward) => reward.id !== id);
        setRewardsList(updatedRewardsList);
        toast.success('Reward deleted successfully!', { autoClose: 1500, hideProgressBar: true });
      } catch (error) {
        console.error("Error deleting reward:", error);
        toast.error('Failed to delete reward.', { autoClose: 1500, hideProgressBar: true });
      }
    };

    const handleLogout = async () => {
      try {
        await firebase.auth().signOut();
        console.log('Logout successful.');
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

    const handleRewardClick = (id) => {
      setSelectedRewardId((prevId) => (prevId === id ? null : id));
    };

    const handleRevealDeleteButton = (id) => {
      setShowDeleteButtonId((prevId) => (prevId === id ? null : id));
    };

    const handleUpdateReward = async (id) => {
      if (!updatedRewardName || !updatedRewardPoints) {
        toast.error('Please fill in both Reward and Points.', { autoClose: 1500, hideProgressBar: true });
        return;
      }

      try {
        const batch = firestore.batch();

        const rewardRef = rewardsCollectionRef.doc(id);
        batch.update(rewardRef, {
          rewardName: updatedRewardName,
          points: updatedRewardPoints,
        });

        await batch.commit();

        const updatedRewardsList = rewardsList.map((reward) => {
          if (reward.id === id) {
            return {
              ...reward,
              rewardName: updatedRewardName,
              points: updatedRewardPoints,
            };
          }
          return reward;
        });

        setRewardsList(updatedRewardsList);
        setSelectedRewardId(id);
        setUpdatingRewardId(null);
        toast.success('Reward updated successfully!', { autoClose: 1500, hideProgressBar: true });
      } catch (error) {
        console.error("Error updating reward:", error);
        toast.error('Failed to update reward.', { autoClose: 1500, hideProgressBar: true });
      }
    };

    const handleTabChange = (tab) => {
      setSelectedTab(tab);
    };

    const tabStyle = {
      fontSize: "18px",
      fontWeight: "bold",
      padding: "10px 40px",
      margin: "0 1px",
      marginBottom: "5px",
      color: "white",
      backgroundColor: "#588157",
      border: "none",
      cursor: "pointer",
      width: "160px",
      height: "40px",
    };

    const activeTabStyle = {
      ...tabStyle,
      backgroundColor: "#34673d",
    };

    useEffect(() => {
      const unsubscribeRequests = firestore.collection("rewardrequest").onSnapshot((snapshot) => {
        const requestsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRequestsList(requestsData);
      });
    
      return () => {
        unsubscribeRequests();
      };
    }, []);

    
    const handleCancelRequest = async (id) => {
      try {
        const shouldDelete = window.confirm('Are you sure you want to delete this request?');
        if (!shouldDelete) {
          return;
        }
    
        const batch = firestore.batch();
    
        const requestRef = firestore.collection("rewardrequest").doc(id);
        batch.delete(requestRef);
    
        await batch.commit();
    
        const updatedRequestsList = requestsList.filter((request) => request.id !== id);
        setRequestsList(updatedRequestsList);
        toast.success('Request deleted successfully!', { autoClose: 1500, hideProgressBar: true });
      } catch (error) {
        console.error("Error deleting request:", error);
        toast.error('Failed to delete request.', { autoClose: 1500, hideProgressBar: true });
      }
    };


    const handleConfirmRequest = async (requestId) => {
      try {
        const db = firebase.firestore();
        const batch = db.batch();
        const requestRef = db.collection('rewardrequest').doc(requestId);
        const completeRequestRef = db.collection('complete_rewardreq').doc(requestId);
        const requestDoc = await requestRef.get();
        
        if (requestDoc.exists) {
          const requestData = requestDoc.data();
          
          if (requestData.pendingStatus) {
            const userRef = db.collection('users').doc(requestData.userId);
            const userDoc = await userRef.get();
            
            if (userDoc.exists) {
              const userData = userDoc.data();
              const currentPoints = userData.userpoints || 0;
              const updatedPoints = currentPoints - requestData.rewardPoints;
              batch.update(userRef, { userpoints: updatedPoints });
            } else {
              toast.error('User document not found.', { autoClose: 1500, hideProgressBar: true });
              return;
            }
            
            const completeRequestData = {
              ...requestData,
              isClaimable: true,
              pendingStatus: false,
              claimDate: firebase.firestore.FieldValue.serverTimestamp(),
            };
            
            batch.update(requestRef, { pendingStatus: false });
            batch.set(completeRequestRef, completeRequestData);
            batch.delete(requestRef);
            await batch.commit();
            
            const updatedRequestsList = requestsList.filter((request) => request.id !== requestId);
            setRequestsList(updatedRequestsList);
            
            toast.success('Request confirmed successfully!', {
              autoClose: 1500,
              hideProgressBar: true,
            });
          } else {
            toast.error('This request has already been confirmed.', { autoClose: 1500, hideProgressBar: true });
          }
        } else {
          toast.error('Request document not found.', { autoClose: 1500, hideProgressBar: true });
        }
      } catch (error) {
        console.error('Error confirming request:', error);
        toast.error('Failed to confirm request.', { autoClose: 1500, hideProgressBar: true });
      }
    };
    
    
    useEffect(() => {
      const unsubscribeCompleteRequests = firestore.collection("complete_rewardreq").where("isClaimable", "==", true).onSnapshot((snapshot) => {
        const completeRequestsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCompleteRequestsList(completeRequestsData);
      });
    
      return () => {
        unsubscribeCompleteRequests();
      };
    }, []);


    const handleClaimRequest = async (claimRequestId) => {
      try {
        const db = firebase.firestore();
        const batch = db.batch();
        const claimRequestRef = db.collection('complete_rewardreq').doc(claimRequestId);
        const claimDate = new Date();
        batch.update(claimRequestRef, {
          isClaimable: false,
          claimDate: claimDate,
          isDoneClaimed: true,
        });
        await batch.commit();
        const updatedCompleteRequestsList = completeRequestsList.filter(
          (completeRequest) => completeRequest.id !== claimRequestId
        );
        setCompleteRequestsList(updatedCompleteRequestsList);
        toast.success('Claim successful!', { autoClose: 1500, hideProgressBar: true });
      } catch (error) {
        console.error('Error claiming request:', error);
        toast.error('Failed to claim request.', { autoClose: 1500, hideProgressBar: true });
      }
    };
    

    useEffect(() => {
      const unsubscribeCompleteRequests = firestore
        .collection("complete_rewardreq")
        .onSnapshot((snapshot) => {
          const completeRequestsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          // Filter and set the data for "Claimable" and "Claimed"
          const claimable = completeRequestsData.filter(
            (completeRequest) => completeRequest.isClaimable === true
          );
          const claimed = completeRequestsData.filter(
            (completeRequest) => completeRequest.isDoneClaimed === true
          );
          
          setClaimableItems(claimable);
          setdoneClaimedItems(claimed);
        });
  
      return () => {
        unsubscribeCompleteRequests();
      };
    }, []);

    
    return (
      <AnimatedPage>
        <div className="home-container">
          <Sidebar isOpen={isOpen} handleTrigger={handleTrigger} navigate={navigate} handleLogout={handleLogout} />

          <div className="content">
            <h1 className="card-view">REWARD PAGE</h1>

            <div className={`floating-form ${showAddForm ? 'visible' : ''}`} ref={formContainerRef}>
              <div className="form-container">
                <div className="form-group">
                  <label htmlFor="rewardName">Reward:</label>
                  <input
                    placeholder="Enter Reward"
                    type="text"
                    id="rewardName"
                    value={rewardName}
                    onChange={(e) => setRewardName(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="points">Points:</label>
                  <input
                    placeholder="Enter Points"
                    type="number"
                    id="points"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="form-control"
                  />
                </div>
                <button onClick={handleAddReward} className="btn btn-primary">
                  Add Reward
                </button>
                <button onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>

            <div className="tabs">
              <button
                style={selectedTab === "REWARD" ? activeTabStyle : tabStyle}
                onClick={() => handleTabChange("REWARD")}
              >
                Reward
              </button>
              <button
                style={selectedTab === "REQUEST" ? activeTabStyle : tabStyle}
                onClick={() => handleTabChange("REQUEST")}
              >
                Request
              </button>
              <button
                style={selectedTab === "CLAIM" ? activeTabStyle : tabStyle}
                onClick={() => handleTabChange("CLAIM")}
              >
                Claim
              </button>
            </div>

            {selectedTab === 'REWARD' && (
        <>
          <div className="rewards-container">
            <h2>Rewards List</h2>
            <div className="rewards-list">
              {rewardsList.map((reward) => (
                <div
                  key={reward.id}
                  className={`reward-item ${selectedRewardId === reward.id ? 'selected' : ''}`}
                  onClick={() => handleRewardClick(reward.id)}
                  onMouseEnter={() => handleRevealDeleteButton(reward.id)}
                  onMouseLeave={() => handleRevealDeleteButton(null)}
                >
                  <h3>{reward.rewardName}</h3>
                  <p>Points: {reward.points}</p>
                  {selectedRewardId === reward.id && (
                    <>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className={`delete-button ${showDeleteButtonId === reward.id ? 'visible' : ''}`}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setUpdatingRewardId(reward.id)}
                        className={`update-button ${showDeleteButtonId === reward.id ? 'visible' : ''}`}
                      >
                        Update
                      </button>
                    </>
                  )}
                  {updatingRewardId === reward.id && (
                    <div className="update-form" onClick={(e) => e.stopPropagation()}>
                      <div className="form-group">
                        <input
                          type="text"
                          id="updatedRewardName"
                          placeholder="Updated Reward"
                          value={updatedRewardName}
                          onChange={(e) => setUpdatedRewardName(e.target.value)}
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="number"
                          id="updatedRewardPoints"
                          placeholder="Updated Points"
                          value={updatedRewardPoints}
                          onChange={(e) => setUpdatedRewardPoints(e.target.value)}
                          className="form-control"
                        />
                      </div>
                      <button onClick={() => handleUpdateReward(reward.id)} className="btn btn-primary">
                        Update
                      </button>
                      <button onClick={() => setUpdatingRewardId(null)} className="btn btn-secondary">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {rewardsList.length === 0 && <p>No rewards found.</p>}
            </div>
          </div>
          <div className="floating-button-container">
            {showAddForm ? (
              <button onClick={() => setShowAddForm(false)} className="floating-add-button">
                -
              </button>
            ) : (
              <button onClick={() => setShowAddForm(true)} className="floating-add-button">
                +
              </button>
            )}
          </div>
        </>
      )}

  {selectedTab === 'REQUEST' && (
    <div className="request-container">
      <h2>Request List</h2>
      <div className="request-list">
      {requestsList.map((request) => (
    <div
      key={request.id}
      className={`request-item ${selectedRewardId === request.id ? 'selected' : ''}`}
      onClick={() => handleRewardClick(request.id)}
      onMouseEnter={() => handleRevealDeleteButton(request.id)}
      onMouseLeave={() => handleRevealDeleteButton(null)}
    >
      <h3>{request.rewardName}</h3>
      <p>User ID: {request.userId}</p>
      <p>Email: {request.userEmail}</p>
      <h3>Coupon Code: {request.couponuserCode}</h3>
      {selectedRewardId === request.id && (
        <>
          <button
            onClick={() => handleCancelRequest(request.id)}
            className={`delete-button ${showDeleteButtonId === request.id ? 'visible' : ''}`}
          >
            Cancel
          </button>
          <button
            onClick={() => handleConfirmRequest(request.id)}
            className={`update-button ${showDeleteButtonId === request.id ? 'visible' : ''}`}
          >
            Confirm
          </button>
        </>
      )}
    </div>
  ))}
        {requestsList.length === 0 && <p>No requests found.</p>}
      </div>
    </div>
  )}

  {selectedTab === 'CLAIM' && (
    <div className="claim-container">
      <h2>Claim List</h2>
      <div className="tab-buttons">
        <button
          className={`tab-button ${selectedClaimTab === 'CLAIMABLE' ? 'active' : ''}`}
          onClick={() => setSelectedClaimTab('CLAIMABLE')}
        >
          Claimable
        </button>
        <button
          className={`tab-button ${selectedClaimTab === 'DONE_CLAIMED' ? 'active' : ''}`}
          onClick={() => setSelectedClaimTab('DONE_CLAIMED')}
        >
          Claimed
        </button>
      </div>
      <div className="claim-list">
        {selectedClaimTab === 'CLAIMABLE' && (
          <>
            {claimableItems.map((completeRequest) => (
              <div key={completeRequest.id} className="claim-item">
                <h3>{completeRequest.rewardName}</h3>
                <p>User ID: {completeRequest.userId}</p>
                <p>Email: {completeRequest.userEmail}</p>
                <h3 className="blue-highlight">Coupon Code: {completeRequest.couponuserCode}</h3>
                <button onClick={() => handleClaimRequest(completeRequest.id)} className="claim-button">
                  Claim
                </button> 
              </div>
            ))}
            {claimableItems.length === 0 && <p>No claimable items found.</p>}
          </>
        )}
        {selectedClaimTab === 'DONE_CLAIMED' && (
  <>
    {doneClaimedItems.map((completeRequest) => (
        <div key={completeRequest.id} className="claim-item">
          <h3>{completeRequest.rewardName}</h3>
          <p>User ID: {completeRequest.userId}</p>
          <p>Email: {completeRequest.userEmail}</p>
          <h3 className="red-highlight">Coupon Code: {completeRequest.couponuserCode}</h3>
          <h3 className="red-highlight">Date: {completeRequest.claimDate ? completeRequest.claimDate.toDate().toLocaleString() : ''}</h3>
        </div>
      ))}
    {doneClaimedItems.length === 0 && <p>No non-claimable items found.</p>}
  </>
)}
      </div>
    </div>
  )}
        </div>
          <ToastContainer autoClose={1500} hideProgressBar />
          </div>
      </AnimatedPage>
    );
  }
  export default React.memo(Reward);