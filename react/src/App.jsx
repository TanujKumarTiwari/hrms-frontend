import { useEffect, useMemo, useState } from "react";

const today = new Date().toISOString().slice(0, 10);

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

function App() {
  const [view, setView] = useState("dashboard");
  const [banner, setBanner] = useState({ message: "", type: "success", visible: false });
  const [dashboard, setDashboard] = useState({
    employeeCount: "-",
    attendanceToday: { present: "-", absent: "-" },
    totalAttendanceRecords: "-",
    today: "",
  });
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [employeesState, setEmployeesState] = useState("");
  const [attendanceState, setAttendanceState] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [employeeForm, setEmployeeForm] = useState({
    employeeId: "",
    fullName: "",
    email: "",
    department: "",
  });
  const [attendanceForm, setAttendanceForm] = useState({
    employeeId: "",
    date: today,
    status: "Present",
  });

  const viewTitle = useMemo(
    () => view.charAt(0).toUpperCase() + view.slice(1),
    [view]
  );

  function showBanner(message, type = "success") {
    setBanner({ message, type, visible: true });
    window.setTimeout(
      () => setBanner((prev) => ({ ...prev, visible: false })),
      2400
    );
  }

  async function loadDashboard() {
    const data = await api("/api/dashboard");
    setDashboard(data);
  }

  async function loadEmployees() {
    setEmployeesState("Loading employees...");
    const data = await api("/api/employees");
    setEmployees(data.employees);
    setEmployeesState(data.employees.length ? "" : "No employees added yet.");
    setAttendanceForm((prev) => ({
      ...prev,
      employeeId: prev.employeeId || data.employees[0]?.employeeId || "",
    }));
  }

  async function loadAttendance(dateFilter = "") {
    setAttendanceState("Loading attendance...");
    const query = dateFilter ? `?date=${encodeURIComponent(dateFilter)}` : "";
    const data = await api(`/api/attendance${query}`);
    setAttendance(data.attendance);
    setAttendanceState(data.attendance.length ? "" : "No attendance records found.");
  }

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([loadDashboard(), loadEmployees(), loadAttendance()]);
      } catch (error) {
        showBanner(error.message, "error");
      }
    })();
  }, []);

  async function onCreateEmployee(event) {
    event.preventDefault();
    try {
      await api("/api/employees", {
        method: "POST",
        body: JSON.stringify(employeeForm),
      });
      setEmployeeForm({ employeeId: "", fullName: "", email: "", department: "" });
      showBanner("Employee added successfully.");
      await Promise.all([loadEmployees(), loadDashboard()]);
    } catch (error) {
      showBanner(error.message, "error");
    }
  }

  async function onDeleteEmployee(employeeId) {
    try {
      await api(`/api/employees/${encodeURIComponent(employeeId)}`, { method: "DELETE" });
      showBanner("Employee deleted successfully.");
      await Promise.all([loadEmployees(), loadDashboard(), loadAttendance(filterDate)]);
    } catch (error) {
      showBanner(error.message, "error");
    }
  }

  async function onCreateAttendance(event) {
    event.preventDefault();
    try {
      await api("/api/attendance", {
        method: "POST",
        body: JSON.stringify(attendanceForm),
      });
      showBanner("Attendance marked successfully.");
      await Promise.all([loadAttendance(filterDate), loadEmployees(), loadDashboard()]);
    } catch (error) {
      showBanner(error.message, "error");
    }
  }

  async function onApplyFilter() {
    try {
      await loadAttendance(filterDate);
    } catch (error) {
      showBanner(error.message, "error");
    }
  }

  async function onClearFilter() {
    setFilterDate("");
    try {
      await loadAttendance("");
    } catch (error) {
      showBanner(error.message, "error");
    }
  }

  return (
    <>
      <div className="background-glow"></div>
      <main className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <p className="brand-tag">Internal Tool</p>
            <h1>HRMS Lite</h1>
          </div>
          <nav className="nav">
            {["dashboard", "employees", "attendance"].map((navView) => (
              <button
                key={navView}
                className={`nav-btn ${view === navView ? "active" : ""}`}
                onClick={() => setView(navView)}
              >
                {navView.charAt(0).toUpperCase() + navView.slice(1)}
              </button>
            ))}
          </nav>
        </aside>

        <section className="content">
          <header className="topbar">
            <h2>{viewTitle}</h2>
            <p>{dashboard.today ? `Today: ${dashboard.today}` : ""}</p>
          </header>

          <div className={`banner ${banner.type} ${banner.visible ? "" : "hidden"}`}>
            {banner.message}
          </div>

          <section className={`view ${view === "dashboard" ? "active" : ""}`}>
            <div className="cards">
              <article className="card">
                <p>Total Employees</p>
                <strong>{dashboard.employeeCount}</strong>
              </article>
              <article className="card">
                <p>Today Present</p>
                <strong>{dashboard.attendanceToday.present}</strong>
              </article>
              <article className="card">
                <p>Today Absent</p>
                <strong>{dashboard.attendanceToday.absent}</strong>
              </article>
              <article className="card">
                <p>Attendance Records</p>
                <strong>{dashboard.totalAttendanceRecords}</strong>
              </article>
            </div>
          </section>

          <section className={`view ${view === "employees" ? "active" : ""}`}>
            <div className="panel">
              <h3>Add Employee</h3>
              <form className="grid-form" onSubmit={onCreateEmployee}>
                <label>
                  Employee ID
                  <input
                    type="text"
                    required
                    placeholder="EMP001"
                    value={employeeForm.employeeId}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({ ...prev, employeeId: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Full Name
                  <input
                    type="text"
                    required
                    placeholder="Ava Thompson"
                    value={employeeForm.fullName}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    required
                    placeholder="ava@company.com"
                    value={employeeForm.email}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Department
                  <input
                    type="text"
                    required
                    placeholder="Engineering"
                    value={employeeForm.department}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({ ...prev, department: e.target.value }))
                    }
                  />
                </label>
                <button type="submit" className="primary-btn">
                  Add Employee
                </button>
              </form>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Employee List</h3>
                <button
                  className="ghost-btn"
                  onClick={async () => {
                    try {
                      await loadEmployees();
                    } catch (error) {
                      showBanner(error.message, "error");
                    }
                  }}
                >
                  Refresh
                </button>
              </div>
              <div className="state">{employeesState}</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Present Days</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.employeeId}>
                        <td>{emp.employeeId}</td>
                        <td>{emp.fullName}</td>
                        <td>{emp.email}</td>
                        <td>{emp.department}</td>
                        <td>{emp.presentDays}</td>
                        <td>
                          <button
                            className="danger-btn"
                            onClick={() => onDeleteEmployee(emp.employeeId)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className={`view ${view === "attendance" ? "active" : ""}`}>
            <div className="panel">
              <h3>Mark Attendance</h3>
              <form className="grid-form two-columns" onSubmit={onCreateAttendance}>
                <label>
                  Employee
                  <select
                    required
                    value={attendanceForm.employeeId}
                    onChange={(e) =>
                      setAttendanceForm((prev) => ({ ...prev, employeeId: e.target.value }))
                    }
                  >
                    {employees.length === 0 ? (
                      <option value="">No employees available</option>
                    ) : (
                      employees.map((emp) => (
                        <option key={emp.employeeId} value={emp.employeeId}>
                          {emp.employeeId} - {emp.fullName}
                        </option>
                      ))
                    )}
                  </select>
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    required
                    value={attendanceForm.date}
                    onChange={(e) =>
                      setAttendanceForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Status
                  <select
                    value={attendanceForm.status}
                    onChange={(e) =>
                      setAttendanceForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </label>
                <button type="submit" className="primary-btn">
                  Save Attendance
                </button>
              </form>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Attendance Records</h3>
                <div className="filters">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                  <button className="ghost-btn" onClick={onApplyFilter}>
                    Filter
                  </button>
                  <button className="ghost-btn" onClick={onClearFilter}>
                    Clear
                  </button>
                </div>
              </div>
              <div className="state">{attendanceState}</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((rec) => (
                      <tr key={`${rec.id}-${rec.employeeId}`}>
                        <td>{rec.date}</td>
                        <td>{rec.employeeId}</td>
                        <td>{rec.fullName}</td>
                        <td>
                          <span className={`status-pill ${rec.status.toLowerCase()}`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}

export default App;
