import React, { useState, useEffect, useRef } from 'react';
import firebase from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import "../css/Home.css";
import Sidebar from '../sidebar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { firestore } from '../config/firebase';
import AnimatedPage from '../AnimatedPage';

function Task() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const handleTrigger = () => setIsOpen(!isOpen);
  const [emptyFieldWarning, setEmptyFieldWarning] = useState(false);
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [points, setPoints] = useState('');
  const [tasksList, setTasksList] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const tasksCollectionRef = firestore.collection('tasks');
  const formContainerRef = useRef(null);
  const [showDeleteButtonId, setShowDeleteButtonId] = useState(null);
  const [updatedTaskName, setUpdatedTaskName] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState('');
  const [updatedLocation, setUpdatedLocation] = useState('');
  const [updatedHours, setUpdatedHours] = useState(0);
  const [updatedMinutes, setUpdatedMinutes] = useState(0);
  const [updatedPoints, setUpdatedPoints] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [selectedTab, setSelectedTab] = useState('TASK');
  const [userAcceptedTasks, setUserAcceptedTasks] = useState([]);
  const [selectedAcceptedItemId, setSelectedAcceptedItemId] = useState(null);
  const [showCancelButtonId, setShowCancelButtonId] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [selectedCompletedItemId, setSelectedCompletedItemId] = useState(null);
  const [selectedSubTab, setSelectedSubTab] = useState('COMPLETED');
  const [confirmedTasks, setConfirmedTasks] = useState([]);
  const [selectedConfirmedItemId, setSelectedConfirmedItemId] = useState(null);


  useEffect(() => {
    const handleClickOutsideForm = (event) => {
      if (formContainerRef.current && !formContainerRef.current.contains(event.target)) {
        if (showAddForm) {
          setShowAddForm(false);
          }
          if (updatingTaskId !== null) {
          setUpdatingTaskId(null);
        }
      }
    };
      document.addEventListener('click', handleClickOutsideForm);
      return () => {
      document.removeEventListener('click', handleClickOutsideForm);
    };
  }, [showAddForm, updatingTaskId]);


  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksSnapshot = await tasksCollectionRef.get();
        const tasksData = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTasksList(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
      };
    const unsubscribe = tasksCollectionRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const taskData = { id: change.doc.id, ...change.doc.data() };
        if (change.type === 'added') {
        } else if (change.type === 'modified' && taskData.isAccepted) {
          tasksCollectionRef.doc(taskData.id).delete();
        }
      });
  
      fetchTasks();
    });
    return () => {
      unsubscribe();
    };
  }, [tasksCollectionRef]);


  useEffect(() => {
    const checkLoggedInUser = async () => {
      const user = firebase.auth().currentUser;
      if (!user) {
        toast.error('Please login to access the tasks page.', { autoClose: 1500, hideProgressBar: true });
        navigate('/login');
      }
      };
      checkLoggedInUser();
    }, [navigate]);


      const handleLogout = async () => {
      try {
      await firebase.auth().signOut();
      console.log('Logout successful.');
      navigate('/login');
      } catch (error) {
      console.error('Logout failed:', error);
      }
    };


    const handleAddTask = async () => {
      if (!taskName || !description || !location || !points) {
        setEmptyFieldWarning(true);
        toast.error('Please fill in all fields.', { autoClose: 1500, hideProgressBar: true });
        return;
      } 
      try {
        const newTask = {
          taskName: taskName,
          description: description,
          location: location,
          timeFrame: { hours: parseInt(hours), minutes: parseInt(minutes) },
          points: points,
          isAccepted: false,
        };
        const batch = firestore().batch();
        const taskDocRef = tasksCollectionRef.doc();
        batch.set(taskDocRef, newTask);
        await batch.commit();   
        setTasksList([...tasksList, newTask]);
        resetForm();
        setShowAddForm(false);
        toast.success('Task added successfully!', { autoClose: 1500, hideProgressBar: true });
      } catch (error) {
        console.error('Error adding task:', error);
        toast.error('Failed to add task.', { autoClose: 1500, hideProgressBar: true });
      }
    };
    


  const handleDeleteTask = async (taskId) => {
    try {
      const shouldDelete = window.confirm('Are you sure you want to delete this task?');
      if (!shouldDelete) {
      return;
      }
      const batch = firestore.batch();
      const taskRef = tasksCollectionRef.doc(taskId);
      batch.delete(taskRef);
      await batch.commit();
      const updatedTasksList = tasksList.filter((task) => task.id !== taskId);
      setTasksList(updatedTasksList);
      toast.success('Task deleted successfully!', { autoClose: 1500, hideProgressBar: true });
      } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task.', { autoClose: 1500, hideProgressBar: true });
     }
   };


    const handleTaskItemClick = (taskId) => {
      setSelectedTaskId((prevId) => (prevId === taskId ? null : taskId));
      };
    const handleRevealDeleteButton = (id) => {
      setShowDeleteButtonId((prevId) => (prevId === id ? null : id));
      };


  const handleUpdateTask = async (taskId) => {
      if (!updatedTaskName || !updatedDescription || !updatedLocation || !updatedPoints) {
      toast.error('Please fill in all fields.', { autoClose: 1500, hideProgressBar: true });
      return;
    }
    try {
      const batch = firestore.batch();
      const taskRef = tasksCollectionRef.doc(taskId);
      batch.update(taskRef, {
          taskName: updatedTaskName,
          description: updatedDescription,
          location: updatedLocation,
          timeFrame: { hours: parseInt(updatedHours), minutes: parseInt(updatedMinutes) },
          points: updatedPoints,
      });
      await batch.commit();
      const updatedTasksList = tasksList.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            taskName: updatedTaskName,
            description: updatedDescription,
            location: updatedLocation,
            timeFrame: { hours: parseInt(updatedHours), minutes: parseInt(updatedMinutes) },
            points: updatedPoints,
          };
        }
        return task;
      });
      setTasksList(updatedTasksList);
      setSelectedTaskId(taskId);
      setUpdatingTaskId(null);
      toast.success('Task updated successfully!', { autoClose: 1500, hideProgressBar: true });
      } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task.', { autoClose: 1500, hideProgressBar: true });
      }
     };


  useEffect(() => {
    const fetchUserAcceptedTasks = async () => {
      try {
        const acceptedTasksSnapshot = await firestore.collection('user_acceptedTask').get();
        const acceptedTasksData = acceptedTasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUserAcceptedTasks(acceptedTasksData);
      } catch (error) {
        console.error('Error fetching user accepted tasks:', error);
      }
    };
    fetchUserAcceptedTasks(); 
    }, []);


  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };
  const resetForm = () => {
    setTaskName('');
    setDescription('');
    setLocation('');
    setHours(0);
    setMinutes(0);
    setPoints('');
    setEmptyFieldWarning(false);
  };
  const tabStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '10px 40px',
    margin: '0 1px',
    marginBottom: '5px',
    color: 'white',
    backgroundColor: '#588157',
    border: 'none',
    cursor: 'pointer',
    width: '170px',
    height: '40px',
    };
  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: '#34673d',
    };


  const handleCancelTask = async (taskId) => {
    try {
      const batch = firestore.batch();
      const acceptedTaskRef = firestore.collection('user_acceptedTask').doc(taskId);
      const taskRef = tasksCollectionRef.doc(taskId);
      batch.delete(acceptedTaskRef);
      batch.update(taskRef, {
        isAccepted: false,
      });
      await batch.commit();
      const updatedUserAcceptedTasks = userAcceptedTasks.filter((task) => task.id !== taskId);
      setUserAcceptedTasks(updatedUserAcceptedTasks);
      toast.success('Accepted task canceled successfully!', {
        autoClose: 1500,
        hideProgressBar: true,
      });
    } catch (error) {
      console.error('Error canceling accepted task:', error);
      toast.error('Failed to cancel accepted task.', {
        autoClose: 1500,
        hideProgressBar: true,
      });
    }
  };


  const handleCompletedItemClick = (itemId) => {
    setSelectedCompletedItemId((prevId) => (prevId === itemId ? null : itemId));
  };
  


  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        const completedTasksSnapshot = await firestore.collection('completed_task').get();
        const completedTasksData = completedTasksSnapshot.docs.map((doc) => {
        const completedTask = doc.data();
            const remainingTime = completedTask.remainingTime;
            return {
            id: doc.id,
            ...doc.data(),
            remainingTime: remainingTime,
            };
            });
            setCompletedTasks(completedTasksData);
            } catch (error) {
            console.error('Error fetching completed tasks:', error);
          }
        };
      fetchCompletedTasks();
    }, []);


    const handleDeleteCompletedTask = async (taskId) => {
      try {
        const batch = firestore.batch();
        const completedTaskRef = firestore.collection('completed_task').doc(taskId);
        batch.delete(completedTaskRef);
        await batch.commit();
        const updatedCompletedTasks = completedTasks.filter((completed) => completed.id !== taskId);
        setCompletedTasks(updatedCompletedTasks);
        toast.success('Completed task deleted successfully!', {
          autoClose: 1500,
          hideProgressBar: true,
        });
      } catch (error) {
        console.error('Error deleting completed task:', error);
        toast.error('Failed to delete completed task.', {
          autoClose: 1500,
          hideProgressBar: true,
        });
      }
    };


  const handleAcceptItemClick = (itemId) => {
    setSelectedAcceptedItemId((prevId) => (prevId === itemId ? null : itemId));
  };
  const handleRevealCancelButton = (itemId) => {
    setShowCancelButtonId((prevId) => (prevId === itemId ? null : itemId));
  };


  useEffect(() => {
    const unsubscribeAccepted = firestore.collection('user_acceptedTask').onSnapshot(snapshot => {
      const acceptedTasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserAcceptedTasks(acceptedTasksData);
      });
    const unsubscribeCompleted = firestore.collection('completed_task').onSnapshot(snapshot => {
      const completedTasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompletedTasks(completedTasksData);
      });
    return () => {
      unsubscribeAccepted();
      unsubscribeCompleted();
      };
  }, []);


  const handleSubTabChange = (tab) => {
    setSelectedSubTab(tab);
  };
  
  const handleConfirmedItemClick = (itemId) => {
    setSelectedConfirmedItemId((prevId) => (prevId === itemId ? null : itemId));
  };
  
  const handleRevealConfirmButton = (itemId) => {
  };


  useEffect(() => {
    const fetchConfirmedTasks = async () => {
      try {
        const confirmedTasksSnapshot = await firestore.collection('completed_task').get();
        const confirmedTasksData = confirmedTasksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setConfirmedTasks(confirmedTasksData);
      } catch (error) {
        console.error('Error fetching confirmed tasks:', error);
      }
    };
    fetchConfirmedTasks();
  }, []);


 const handleConfirmCompletedTask = async (taskId) => {
      try {
        const batch = firestore.batch();
        const completedTaskRef = firestore.collection('completed_task').doc(taskId);
        batch.update(completedTaskRef, {
          isConfirmed: true,
        });
        await batch.commit();
        const updatedCompletedTasks = completedTasks.map((completed) => {
          if (completed.id === taskId) {
            return {
              ...completed,
              isConfirmed: true,
            };
          }
          return completed;
        });
        setCompletedTasks(updatedCompletedTasks);
        await updatePointsFromCompletedTasks(taskId);
        toast.success('Task confirmed successfully!', {
          autoClose: 1500,
          hideProgressBar: true,
        });
      } catch (error) {
        console.error('Error confirming task:', error);
        toast.error('Failed to confirm task.', {
          autoClose: 1500,
          hideProgressBar: true,
        });
      }
    };
  

  const updatePointsFromCompletedTasks = async (taskId) => {
    try {
      const completedTaskDoc = await firestore.collection('completed_task').doc(taskId).get();
      const completedTaskData = completedTaskDoc.data();
      const userId = completedTaskData.acceptedBy;
      const userDoc = await firestore.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const currentPoints = userData.userpoints || 0;
        const taskPoints = parseInt(completedTaskData.points, 10);
        const updatedPoints = currentPoints + taskPoints;
        await firestore.collection('users').doc(userId).update({
          userpoints: updatedPoints,
        });
        console.log('User points updated successfully.');
      }
    } catch (error) {
      console.error('Error updating user points:', error);
    }
  };
  

  return (
    <AnimatedPage>
      <div className="home-container">
        <Sidebar isOpen={isOpen} handleTrigger={handleTrigger} navigate={navigate} handleLogout={handleLogout} />
        <div className="content">
          <h1 className="card-view">TASK PAGE</h1>
          <div className={`floating-form ${showAddForm ? 'visible' : ''}`} ref={formContainerRef}>
            <div className="form-container">
              <div className="form-group">
                <label htmlFor="taskName">Task:</label>
                <input
                  placeholder="Enter Task"
                  type="text"
                  id="taskName"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <input
                  placeholder="Enter Description"
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location:</label>
                <input
                  placeholder="Enter Location"
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="hours">Time Frame (Hours):</label>
                  <input
                     type="number"
                     id="hours"
                     placeholder='0'
                     value={hours === 0 ? '' : hours}
                     onChange={(e) => setHours(Math.min(23, Math.max(0, parseInt(e.target.value))))}
                     className="form-control"
                   />
                  </div>
               <div className="form-group">
                <label htmlFor="minutes">Time Frame (Minutes):</label>
                  <input
                   type="number"
                   id="minutes"
                   placeholder='0'
                   value={minutes === 0 ? '' : minutes}
                   onChange={(e) => setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value))))}
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
              <button onClick={handleAddTask} className="btn btn-primary">
                Add Task
              </button>
              <button onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
          <div className="tabs">
            <button
              style={selectedTab === 'TASK' ? activeTabStyle : tabStyle}
              onClick={() => handleTabChange('TASK')}
            >
              Task
            </button>
            <button
              style={selectedTab === 'ACCEPT' ? activeTabStyle : tabStyle}
              onClick={() => handleTabChange('ACCEPT')}
            >
              Accept
            </button>
            <button
              style={selectedTab === 'COMPLETE' ? activeTabStyle : tabStyle}
              onClick={() => handleTabChange('COMPLETE')}
            >
              Complete
            </button>
          </div>



          {selectedTab === 'TASK' && (
            <>
              <div className="tasks-container">
                <h2>Tasks List</h2>
                <div className="tasks-list">
                  {tasksList.map((task) => (
                    <div
                      key={task.id}
                      className={`task-item ${selectedTaskId === task.id ? 'selected' : ''}`}
                      onClick={() => handleTaskItemClick(task.id)}
                      onMouseEnter={() => handleRevealDeleteButton(task.id)}
                      onMouseLeave={() => handleRevealDeleteButton(null)}
                    >
                      <h3>{task.taskName}</h3>
                      <p>Description: {task.description}</p>
                      <p>Location: {task.location}</p>
                      <p>Time Frame: {task.timeFrame?.hours || 0} hours {task.timeFrame?.minutes || 0} minutes</p>
                      <p>Points: {task.points}</p>
                      {selectedTaskId === task.id && (
                        <>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className={`delete-button ${showDeleteButtonId === task.id ? 'visible' : ''}`}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setUpdatingTaskId(task.id)}
                            className={`update-button ${showDeleteButtonId === task.id ? 'visible' : ''}`}
                          >
                            Update
                          </button>
                        </>
                      )}
                      {updatingTaskId === task.id && (
                        <div className="update-form" onClick={(e) => e.stopPropagation()}>
                          <div className="form-group">
                            <input
                              type="text"
                              id="updatedTaskName"
                              placeholder="Update Task Name"
                              value={updatedTaskName}
                              onChange={(e) => setUpdatedTaskName(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <input
                              type="text"
                              id="updatedDescription"
                              placeholder="Update Description"
                              value={updatedDescription}
                              onChange={(e) => setUpdatedDescription(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <input
                              type="text"
                              id="updatedLocation"
                              placeholder="Update Location"
                              value={updatedLocation}
                              onChange={(e) => setUpdatedLocation(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <input
                              type="number"
                              id="updatedHours"
                              placeholder="0"
                              value={updatedHours === 0 ? '' : updatedHours}
                              onChange={(e) => setUpdatedHours(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <input
                              type="number"
                              id="updatedMinutes"
                              placeholder="0"
                              value={updatedMinutes === 0 ? '' : updatedMinutes}
                              onChange={(e) => setUpdatedMinutes(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <input
                              type="number"
                              id="updatedPoints"
                              placeholder="0"
                              value={updatedPoints}
                              onChange={(e) => setUpdatedPoints(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <button onClick={() => handleUpdateTask(task.id)} className="btn btn-primary">
                            Update
                          </button>
                          <button onClick={() => setUpdatingTaskId(null)} className="btn btn-secondary">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {tasksList.length === 0 && <p>No tasks found.</p>} 
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



    {selectedTab === 'ACCEPT' && (
        <div className="accept-container">
        <h2>Accept Content</h2>
        <div className="accept-list">
        {userAcceptedTasks.map((accepted) => (
        <div
          key={accepted.id}
          className={`accept-item ${selectedAcceptedItemId === accepted.id ? 'selected' : ''}`}
          onClick={() => handleAcceptItemClick(accepted.id)}
          onMouseEnter={() => handleRevealCancelButton(accepted.id)}
          onMouseLeave={() => handleRevealCancelButton(null)}
         >
             {accepted.isStarted ? (
             <div className="ongoing-indicator"></div>
             ) : null}
          <h3>{accepted.taskName}</h3>
              <p>Description: {accepted.description}</p>
            {accepted.timeFrame ? (
              <p>Time Frame: {accepted.timeFrame.hours} hours {accepted.timeFrame.minutes} minutes</p>
              ) : (
              <p>Time Frame: N/A</p>
              )}
              <p>Points: {accepted.points}</p>
              <p>User ID: {accepted.acceptedBy}</p>
              <p>Accepted By: {accepted.acceptedByEmail}</p>
            {selectedAcceptedItemId === accepted.id && !accepted.isStarted && (
                  <button
                  onClick={() => handleCancelTask(accepted.id)}
                  className={`delete-button ${showCancelButtonId === accepted.id ? 'visible' : ''}`}
                  >
                  Cancel
                  </button>
                  )}
                  </div>
                  ))}
                {userAcceptedTasks.length === 0 && <p>No Accepted tasks found.</p>}
          </div>
      </div>
    )}



{selectedTab === 'COMPLETE' && (
  <div className="complete-container">
    <h2>Complete Content</h2>
    <div className="tab-buttons">
      <button
        className={`tab-button ${selectedSubTab === 'COMPLETED' ? 'active' : ''}`}
        onClick={() => handleSubTabChange('COMPLETED')}
      >
        Completed
      </button>
      <button
        className={`tab-button ${selectedSubTab === 'CONFIRMED' ? 'active' : ''}`}
        onClick={() => handleSubTabChange('CONFIRMED')}
      >
        Confirmed
      </button>
    </div>
    <div className="completed-list">
      {selectedSubTab === 'COMPLETED' && (
        <>
          {completedTasks
            .filter((completed) => !completed.isConfirmed)
            .map((completed) => (
              <div
                key={completed.id}
                className={`completed-item ${selectedCompletedItemId === completed.id ? 'selected' : ''}`}
                onClick={() => handleCompletedItemClick(completed.id)}
                onMouseEnter={() => handleRevealDeleteButton(completed.id)}
                onMouseLeave={() => handleRevealDeleteButton(null)}
              >
                <h3>{completed.taskName}</h3>
                <p>Description: {completed.description}</p>
                {completed.timeFrame ? (
                  <p>Time Frame: {completed.timeFrame.hours}:{completed.timeFrame.minutes}:00</p>
                ) : (
                  <p>Time Frame: N/A</p>
                )}
                <p>Points: {completed.points}</p>
                <p>User ID: {completed.acceptedBy}</p>
                <p>User Email: {completed.acceptedByEmail}</p>
                <p>End Time: {completed.remainingTime}</p>
                {selectedCompletedItemId === completed.id && (
                  <div className={`completed-item-actions ${showDeleteButtonId === completed.id ? 'visible' : ''}`}>
                    <div className="centered-image">
                      {completed.imageUrl && (
                        <img
                          src={completed.imageUrl}
                          alt="Completed Task"
                          className="responsive-image"
                        />
                      )}
                    </div>
                    <button onClick={() => handleConfirmCompletedTask(completed.id)} className="confirm-button">
                      Confirm
                    </button>
                    <button onClick={() => handleDeleteCompletedTask(completed.id)} className="delete-button">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          {completedTasks.filter((completed) => !completed.isConfirmed).length === 0 && (
            <p>No completed tasks found.</p>
          )}
        </>
      )}
      {selectedSubTab === 'CONFIRMED' && (
  <div className="confirmed-list">
    {confirmedTasks
      .filter((confirmed) => confirmed.isConfirmed)
      .map((confirmed) => (
        <div
          key={confirmed.id}
          className={`confirmed-item ${selectedConfirmedItemId === confirmed.id ? 'selected' : ''}`}
          onClick={() => handleConfirmedItemClick(confirmed.id)}
          onMouseEnter={() => handleRevealConfirmButton(confirmed.id)}
          onMouseLeave={() => handleRevealConfirmButton(null)}
        >
          <h3>{confirmed.taskName}</h3>
          <p>Description: {confirmed.description}</p>
          {confirmed.timeFrame ? (
            <p>Time Frame: {confirmed.timeFrame.hours}:{confirmed.timeFrame.minutes}:00</p>
          ) : (
            <p>Time Frame: N/A</p>
          )}
          <p>Points: {confirmed.points}</p>
          <p>User ID: {confirmed.acceptedBy}</p>
          <p>User Email: {confirmed.acceptedByEmail}</p>
          <p>End Time: {confirmed.remainingTime}</p>
          <p>Status: Confirmed</p>
          {selectedConfirmedItemId === confirmed.id && (
            <div className={`confirmed-item-actions ${showDeleteButtonId === confirmed.id ? 'visible' : ''}`}>
              <div className="centered-image">
                {confirmed.imageUrl && (
                  <img
                    src={confirmed.imageUrl}
                    alt="Confirmed Task"
                    className="responsive-image"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    {confirmedTasks.filter((confirmed) => confirmed.isConfirmed).length === 0 && (
      <p>No confirmed tasks found.</p>
      )}
      </div>
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
export default React.memo(Task);