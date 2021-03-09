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
          if (sortedField.field === 'wage') {
            const x = a[sortedField.field].split('.');
            const y = b[sortedField.field].split('.');

            if (x[0] === y[0]) {
              if (x[1] > y[1]) {
                return -1;
              } else {
                return 1;
              }
            }
          }
          // if (a[sortedField.field] < b[sortedField.field]) {
          //   return sortedField.order === 'asc' ? -1 : 1;
          // }
          // if (a[sortedField.field] > b[sortedField.field]) {
          //   return sortedField.order === 'asc' ? 1 : -1;
          // }
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

  const { list, requestSort, sortedField } = useSortableData(employeeList);

  const firstInput = React.useRef('firstInput');

  function resetForm() {
    setName('');
    setAge('');
    setGender('');
    setPosition('');
    setWage('');
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

  function getSortedClassName(name) {
    if (!sortedField) return;
    return sortedField.field === name ? sortedField.order : undefined;
  }

  return (
    <div className="App">
      <div className="form">
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
        <button onClick={handleSubmit}>Add employee</button>
        <button onClick={resetForm}>Reset</button>
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
                  onClick={() => requestSort('name')}
                  className={getSortedClassName('name')}
                >
                  Name
                </th>
                <th
                  onClick={() => requestSort('age')}
                  className={getSortedClassName('age')}
                >
                  Age
                </th>
                <th
                  onClick={() => requestSort('gender')}
                  className={getSortedClassName('gender')}
                >
                  Gender
                </th>
                <th
                  onClick={() => requestSort('position')}
                  className={getSortedClassName('position')}
                >
                  Position
                </th>
                <th
                  onClick={() => requestSort('wage')}
                  className={getSortedClassName('wage')}
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
                    <td>$ {employee.wage}</td>
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
