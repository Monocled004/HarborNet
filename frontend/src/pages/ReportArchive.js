

import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportArchive() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('issue_date');
  const [sortDir, setSortDir] = useState('desc');
  const [pageSize] = useState(10);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/reports?verified=true')
      .then(res => res.json())
      .then(data => setReports(Array.isArray(data) ? data : []));
  }, []);

  // Filtering and searching
  const filtered = reports.filter(r => {
    const matchesSearch = search === '' || (r.description && r.description.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === '' || (r.category && r.category === filter);
    return matchesSearch && matchesFilter;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    if (sortKey === 'issue_date' && aVal && bVal) {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  // Export as CSV
  const exportCSV = () => {
    const header = ['ID', 'Category', 'Description', 'Date', 'Uploader'];
    const rows = sorted.map(r => [r.id, r.category, r.description, r.issue_date, r.uploader]);
    const csv = [header, ...rows].map(row => row.map(x => '"' + (x || '') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report_archive.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Chart data
  const lineData = {
    labels: sorted.map(r => r.issue_date).filter((v, i, arr) => arr.indexOf(v) === i),
    datasets: [
      {
        label: 'Reports Over Time',
        data: sorted.reduce((acc, r) => {
          acc[r.issue_date] = (acc[r.issue_date] || 0) + 1;
          return acc;
        }, {}),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.2)',
        tension: 0.3,
        fill: true,
        pointRadius: 2
      }
    ]
  };
  lineData.datasets[0].data = lineData.labels.map(date => lineData.datasets[0].data[date] || 0);

  const barData = {
    labels: [...new Set(sorted.map(r => r.category))],
    datasets: [
      {
        label: 'Reports by Category',
        data: [...new Set(sorted.map(r => r.category))].map(cat => sorted.filter(r => r.category === cat).length),
        backgroundColor: '#42a5f5',
      }
    ]
  };

  return (
    <main>
      <section className="report-archive m-3">
        <h2 className="heading-info m-2">Report Archive / History</h2>
        {/* Top Bar: Search, Filters */}
        <div className="flex align-items-center gap-1 m-2 mb-2">
          <input
            type="text"
            placeholder="Search description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="min-w-120"
          />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="min-w-120">
            <option value="">All Categories</option>
            {[...new Set(reports.map(r => r.category))].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="flex justify-end mb-2">
            <button className="btn" style={{ position: 'absolute', right: '3vw', width: '200px'}} onClick={exportCSV}>Export</button>
          </div>
        </div>
        {/* Main Content: Table left, Graphs right */}
        <div className="flex gap-2 align-items-stretch min-h-70vh" style={{ height: '68vh', minHeight: '500px' }}>
          {/* Table: Report History */}
          <div className="flex-2 min-w-120 h-100" style={{ tableLayout: 'fixed', width: '100%', minHeight: 0 }}>
            <div className="card flex flex-column h-100" style={{ overflowX: 'initial', position: 'relative', minHeight: '60vh' }}>
              <div className="flex-1" style={{ overflowY: 'auto', minHeight: 0 }}>
                <table className="w-100" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th className="pointer" onClick={() => { setSortKey('id'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>ID</th>
                      <th className="pointer" onClick={() => { setSortKey('category'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>Category</th>
                      <th>Description</th>
                      <th className="pointer" onClick={() => { setSortKey('issue_date'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>Date</th>
                      <th>Uploader</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(r => (
                      <tr key={r.id} className="border-bottom">
                        <td>{r.id}</td>
                        <td>{r.category}</td>
                        <td>{r.description}</td>
                        <td>{r.issue_date}</td>
                        <td>{r.uploader}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination at bottom right */}
              <div style={{ position: 'absolute', right: '4px', bottom: '4px', minHeight: '2em' }}>
                <div className="flex justify-end align-items-center gap-1 mt-1" style={{ position: 'absolute', right: '0em', bottom: '0em' }}>
                  <button className="btn" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
                  <span>Page {page} of {totalPages}</span>
                  <button className="btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
                </div>
              </div>
            </div>
          </div>
          {/* Graphs Section: right column, stacked, larger */}
          <div className="flex-1 min-w-120 flex flex-column gap-1 h-100" style={{ minHeight: 0 }}>
            <div className="card p-1 flex-1" style={{ minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h4 className="m-1" style={{ fontSize: 16 }}>Line Chart: Reports Over Time</h4>
              <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center' }}>
                <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} height={180} />
              </div>
            </div>
            <div className="card p-1 flex-1" style={{ minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h4 className="m-1" style={{ fontSize: 16 }}>Bar Chart: Reports by Category</h4>
              <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center' }}>
                <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} height={180} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}