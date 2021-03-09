import React from 'react';
import axios from 'axios';
import './App.css';

function useSortableData(list, order = null) {
  const [sortedField, setSortedField] = React.useState({
    field: '',
    order: 'asc',
  });

  const sortedItems = React.useMemo(() => {
    if (sortedField !== null) {
      let sortableItems = [
        ...list.sort((a, b) => {
          if (
            isNaN(parseFloat(a[sortedField.field])) ||
            isNaN(parseFloat(b[sortedField.field]))
          ) {
            if (a[sortedField.field] < b[sortedField.field]) {
              return sortedField.order === 'asc' ? -1 : 1;
            }
            if (a[sortedField.field] > b[sortedField.field]) {
              return sortedField.order === 'asc' ? 1 : -1;
            }
          } else {
            if (
              parseFloat(a[sortedField.field]) <
              parseFloat(b[sortedField.field])
            ) {
              return sortedField.order === 'asc' ? -1 : 1;
            }
            if (
              parseFloat(a[sortedField.field]) >
              parseFloat(b[sortedField.field])
            ) {
              return sortedField.order === 'asc' ? 1 : -1;
            }
          }
          return 0;
        }),
      ];
      return sortableItems;
    }
  }, [sortedField, list]);

  function requestSort(field) {
    let order = 'asc';
    if (sortedField.field === field && sortedField.order === 'asc') {
      order = 'desc';
    }

    setSortedField({ field, order });
  }

  return { list: sortedItems, requestSort, sortedField };
}

function App() {
  const [name, setName] = React.useState('');
  const [age, setAge] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [position, setPosition] = React.useState('');
  const [wage, setWage] = React.useState('');
  const [isShowingEmployees, setIsShowingEmployees] = React.useState(false);
  const [employeeList, setEmployeeList] = React.useState([]);
  const [isEditing, setIsEditing] = React.useState({ state: false, id: null });

  // eslint-disable-next-line no-unused-vars
  const { list, requestSort, sortedField } = useSortableData(employeeList);

  const firstInput = React.useRef('firstInput');

  function resetForm() {
    setName('');
    setAge('');
    setGender('');
    setPosition('');
    setWage('');
    setIsEditing({ state: false, id: null });
    firstInput.current.focus();
  }

  function handleSubmit() {
    (async function () {
      try {
        const request = await axios.post('http://localhost:3001/api/create', {
          name,
          age,
          gender,
          position,
          wage,
        });

        if (request.status === 200) {
          setEmployeeList([
            ...employeeList,
            {
              name,
              age,
              gender,
              position,
              wage,
            },
          ]);
          return alert('Employee insert succeeded!');
        }
      } catch (err) {
        console.log(err);
      } finally {
        resetForm();
        if (isShowingEmployees) getEmployees();
      }
    })();
  }

  function submitEdit() {
    (async function () {
      try {
        const response = await axios.put('http://localhost:3001/api/update', {
          name,
          age,
          gender,
          position,
          wage,
          id: isEditing.id,
        });

        if (response.status === 200) {
          setEmployeeList([
            ...employeeList.filter((employee) => employee.id !== isEditing.id),
            { name, age, gender, position, wage, id: isEditing.id },
          ]);
          alert('Employee modifications submit succeeded!');
        }
      } catch (err) {
        console.log(err);
      } finally {
        setIsEditing({ state: false, id: null });
        resetForm();
      }
    })();
  }

  function handleShowEmployees() {
    setIsShowingEmployees(!isShowingEmployees);
    if (!isShowingEmployees) getEmployees();
  }

  function getEmployees() {
    (async function () {
      try {
        const response = await axios.get('http://localhost:3001/api/employees');

        if (response.status === 200) {
          setEmployeeList([...response.data]);
        }
      } catch (err) {
        console.log(err);
      } finally {
        if (!isShowingEmployees) setIsShowingEmployees(!isShowingEmployees);
      }
    })();
  }

  function setEdit(employee) {
    setIsEditing({
      state: true,
      id: employee.id,
    });

    setName(employee.name);
    setAge(employee.age);
    setGender(employee.gender);
    setPosition(employee.position);
    setWage(employee.wage);
  }

  function getSortedClassName(name) {
    if (!sortedField) return;
    return sortedField.field === name ? sortedField.order : undefined;
  }

  function handleDelete(employee) {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure?'))
      (async function () {
        try {
          const response = await axios.delete(
            `http://localhost:3001/api/delete/${employee.id}`,
            {}
          );

          if (response.status === 200) {
            setEmployeeList([
              ...employeeList.filter(
                (currentEmployee) => currentEmployee.id !== employee.id
              ),
            ]);
            alert('Delete succeeded!');
          }
        } catch (err) {
          console.log(err);
        }
      })();
    return;
  }

  return (
    <div className="App">
      <div className="form">
        <h2 className="form-title">{isEditing.state ? 'Edit' : 'New'}</h2>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          name="name"
          id="name"
          ref={firstInput}
          value={name}
          onChange={({ target }) => setName(target.value)}
        />
        <label htmlFor="age">Age:</label>
        <input
          type="number"
          name="age"
          id="age"
          value={age}
          onChange={({ target }) => setAge(target.value)}
        />
        <label htmlFor="gender">Gender:</label>
        <select
          name="gender"
          id="gender"
          value={gender}
          onChange={({ target }) => setGender(target.value)}
        >
          <option value="" disabled>
            Select
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <label htmlFor="position">Position:</label>
        <input
          type="text"
          name="position"
          id="position"
          value={position}
          onChange={({ target }) => setPosition(target.value)}
        />
        <label htmlFor="wage">Wage (yearly):</label>
        <input
          type="number"
          name="wage"
          id="wage"
          value={wage}
          onChange={({ target }) => setWage(target.value)}
        />
        {isEditing.state ? (
          <button onClick={submitEdit}>Save modifications</button>
        ) : (
          <button onClick={handleSubmit}>Add employee</button>
        )}

        <button onClick={resetForm}>
          {isEditing.state ? 'Come back' : 'Reset fields'}
        </button>
      </div>
      <div className="employees">
        <hr />
        <button onClick={handleShowEmployees}>
          {isShowingEmployees ? 'Hide employees' : 'Show employees'}
        </button>
        {employeeList.length !== 0 && isShowingEmployees && (
          <table className="table">
            <tbody>
              <tr>
                <th
                  onDoubleClick={() => requestSort('name')}
                  className={getSortedClassName('name')}
                  title="Sort by name"
                >
                  Name
                </th>
                <th
                  onDoubleClick={() => requestSort('age')}
                  className={getSortedClassName('age')}
                  title="Sort by age"
                >
                  Age
                </th>
                <th
                  onDoubleClick={() => requestSort('gender')}
                  className={getSortedClassName('gender')}
                  title="Sort by gender"
                >
                  Gender
                </th>
                <th
                  onDoubleClick={() => requestSort('position')}
                  className={getSortedClassName('position')}
                  title="Sort by position"
                >
                  Position
                </th>
                <th
                  onDoubleClick={() => requestSort('wage')}
                  className={getSortedClassName('wage')}
                  title="Sort by wage"
                >
                  Wage
                </th>
              </tr>
              {employeeList.map((employee) => {
                return (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.age}</td>
                    <td>{employee.gender}</td>
                    <td>{employee.position}</td>
                    <td>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(employee.wage)}
                    </td>
                    <td>
                      <span
                        onClick={() => setEdit(employee)}
                        className="btn edit"
                        title="Edit employee"
                      >
                        ↺
                      </span>
                    </td>
                    <td>
                      <span
                        onClick={() => handleDelete(employee)}
                        className="btn delete"
                        title="Delete employee"
                      >
                        ⨉
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
