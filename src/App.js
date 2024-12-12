import React, { useState,useContext} from "react";
import Calendar from "react-calendar"; 
import "react-calendar/dist/Calendar.css";
import "./App.css";
import { ThemeContext} from "./ThemeContext";

const App = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDetail, setTaskDetail] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [pendingVisibleCount, setPendingVisibleCount] = useState(2);
  const [completedVisibleCount, setCompletedVisibleCount] = useState(2);
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : {};
  });
  

  const addTask = () => {
    const formattedDate = selectedDate.toLocaleDateString("en-CA");

    if (!taskTitle.trim() || !taskDetail.trim()) {
      alert("Please provide both title and detail of the task.");
      return;
    }

    const newTask = {
      id: Date.now(),
      title: taskTitle,
      detail: taskDetail,
      startDate: formattedDate,
      status: "pending",
    };

    if (editingTask) {
      setTasks((prevTasks) => {
        const updatedTasks = { ...prevTasks };
        updatedTasks[formattedDate][editingTask.index] = {
          ...updatedTasks[formattedDate][editingTask.index],
          ...newTask,
        };
        return updatedTasks;
      });
      setEditingTask(null);
    } else {
      setTasks((prevTasks) => {
        const updatedTasks = { ...prevTasks };
        if (!updatedTasks[formattedDate]) updatedTasks[formattedDate] = [];
        updatedTasks[formattedDate] = [newTask, ...updatedTasks[formattedDate]];
        return updatedTasks;
      });
    }

    setTaskTitle("");
    setTaskDetail("");
  };

  const toggleTaskStatus = (date, id) => {
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };

      if (updatedTasks[date]) {
        updatedTasks[date] = updatedTasks[date].map((task) =>
          task.id === id
            ? { ...task, status: task.status === "pending" ? "completed" : "pending" }
            : task
        );
      }

      updatedTasks[date] = updatedTasks[date].sort((a, b) => b.id - a.id);

      return updatedTasks;
    });
  };

  const deleteTask = (date, id) => {
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      updatedTasks[date] = updatedTasks[date].filter((task) => task.id !== id);
      if (updatedTasks[date].length === 0) delete updatedTasks[date];
      return updatedTasks;
    });
  };

  const editTask = (date, id) => {
    const taskToEdit = tasks[date].find((task) => task.id === id);
    setTaskTitle(taskToEdit.title);
    setTaskDetail(taskToEdit.detail);
    setEditingTask({ date, id });
  };

  const loadMorePendingTasks = () => {
    setPendingVisibleCount((prevCount) => prevCount + 2);
  };

  const loadMoreCompletedTasks = () => {
    setCompletedVisibleCount((prevCount) => prevCount + 2);
  };

  const formattedDate = selectedDate.toLocaleDateString("en-CA");
  const formatSelectedDate = (date) => {
    const day = date.toLocaleDateString("en-US", { day: "2-digit" });
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.toLocaleDateString("en-US", { year: "numeric" });

    return `${day}, ${month} ${year}`;
  };

  const tasksForDate = tasks[formattedDate] || [];

  const pendingTasks = tasksForDate.filter((task) => task.status === "pending");
  const completedTasks = tasksForDate.filter((task) => task.status === "completed");

  const filteredPendingTasks = pendingTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.detail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompletedTasks = completedTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.detail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`container ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <header className="header">
        <h1>Hello, Divyanshi, Start Planning Today</h1>
        <div className="toggle-switch">
          <label className="switch">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={toggleTheme}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </header>

      <div className="content">
        <div className="cal">
          <p>{selectedDate.toLocaleDateString("en-US", { weekday: "long" })}</p>
          <h2>{formatSelectedDate(selectedDate)}</h2>
          <div className="calendar-section">
            <Calendar onChange={setSelectedDate} value={selectedDate} />
          </div>
          <div className="task-count">
          <p>Total Tasks: {tasksForDate.length}</p>
        </div>

        </div>
        
        <div className="task-section">
          <div className="task-form">
            <input
              type="text"
              placeholder="Type Title Of Task"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Detail Of Your Task"
              value={taskDetail}
              onChange={(e) => setTaskDetail(e.target.value)}
            />
            <button onClick={addTask}>{editingTask ? "Update" : "+"}</button>
          </div>
        <div className="search">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar"
          />
          </div>
          <div className="task-list">
            <div className="task-pending">
              <h3 className="pen">Pending Tasks</h3>
              {filteredPendingTasks.length === 0 ? (
                <p>No pending tasks for this day.</p>
              ) : (
                filteredPendingTasks.slice(0, pendingVisibleCount).map((task) => (
                  <div key={task.id} className="task-card">
                    <h3>{task.title}</h3>
                    <p>{task.detail}</p>
                    <p><b>Start date:</b> {task.startDate}</p>
                    <div className="task-actions">
                      <button onClick={() => toggleTaskStatus(formattedDate, task.id)}>
                        Mark as Completed
                      </button>
                      <button onClick={() => editTask(formattedDate, task.id)}>Edit</button>
                      <button onClick={() => deleteTask(formattedDate, task.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
              <div className="lm">
              {filteredPendingTasks.length > pendingVisibleCount && (
                <button onClick={loadMorePendingTasks} className="load-more">Load More</button>
              )}
              </div>
            </div>

            <div className="task-complete">
              <h3 className="pen">Completed Tasks</h3>
              {filteredCompletedTasks.length === 0 ? (
                <p>No completed tasks for this day.</p>
              ) : (
                filteredCompletedTasks.slice(0, completedVisibleCount).map((task) => (
                  <div key={task.id} className="task-card completed">
                    <h3>{task.title}</h3>
                    <p>{task.detail}</p>
                    <p><b>Start date:</b> {task.startDate}</p>
                    <div className="task-actions">
                      <button onClick={() => toggleTaskStatus(formattedDate, task.id)}>
                        Mark as Pending
                      </button>
                      <button onClick={() => editTask(formattedDate, task.id)}>Edit</button>
                      <button onClick={() => deleteTask(formattedDate, task.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
              <div className="lm">
              {filteredCompletedTasks.length > completedVisibleCount && (
                <button onClick={loadMoreCompletedTasks} className="load-morec">Load More</button>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
