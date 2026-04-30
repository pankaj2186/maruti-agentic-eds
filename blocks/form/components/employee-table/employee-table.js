export default function decorate(fieldDiv, fieldJson) {
  const input = fieldDiv.querySelector('input');
  const { dataEndpoint, searchPlaceholder = 'Search employees...' } = fieldJson?.properties || {};

  input.style.display = 'none';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = searchPlaceholder;
  searchInput.className = 'employee-table-search';
  searchInput.setAttribute('aria-label', searchPlaceholder);

  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'employee-table-wrapper';

  const table = document.createElement('table');
  table.className = 'employee-table';
  table.setAttribute('role', 'grid');

  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th scope="col">Employee Code</th>
      <th scope="col">Employee Name</th>
      <th scope="col">Designation Code</th>
      <th scope="col">Designation</th>
    </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  tableWrapper.appendChild(table);

  let employees = [];
  let selectedRow = null;

  const renderRows = (data) => {
    tbody.innerHTML = '';
    if (!data.length) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="4" class="no-results">No employees found.</td>';
      tbody.appendChild(tr);
      return;
    }
    data.forEach((emp) => {
      const tr = document.createElement('tr');
      tr.setAttribute('role', 'row');
      tr.setAttribute('tabindex', '0');
      tr.innerHTML = `
        <td>${emp.empCode ?? ''}</td>
        <td>${emp.empName ?? ''}</td>
        <td>${emp.desgCode ?? ''}</td>
        <td>${emp.desgDesc ?? ''}</td>`;

      const selectRow = () => {
        if (selectedRow) selectedRow.classList.remove('selected');
        tr.classList.add('selected');
        selectedRow = tr;
        input.value = emp.empCode ?? '';
        input.dispatchEvent(new Event('change', { bubbles: true }));
      };

      tr.addEventListener('click', selectRow);
      tr.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectRow();
        }
      });
      tbody.appendChild(tr);
    });
  };

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = employees.filter((emp) => (
      (emp.empCode ?? '').toLowerCase().includes(q)
      || (emp.empName ?? '').toLowerCase().includes(q)
      || (emp.desgCode ?? '').toLowerCase().includes(q)
      || (emp.desgDesc ?? '').toLowerCase().includes(q)
    ));
    renderRows(filtered);
  });

  const container = document.createElement('div');
  container.className = 'employee-table-container';
  container.appendChild(searchInput);
  container.appendChild(tableWrapper);
  fieldDiv.appendChild(container);

  if (dataEndpoint) {
    tbody.innerHTML = '<tr><td colspan="4" class="loading">Loading...</td></tr>';
    fetch(dataEndpoint)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data) => {
        employees = Array.isArray(data) ? data : (data.employees ?? []);
        renderRows(employees);
      })
      .catch(() => {
        tbody.innerHTML = '<tr><td colspan="4" class="error">Failed to load employee data.</td></tr>';
      });
  }

  return fieldDiv;
}