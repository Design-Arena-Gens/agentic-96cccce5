'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

function MoonIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeWidth="2" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="11" cy="11" r="8" strokeWidth="2" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
    </svg>
  );
}
function PrintIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M6 9V2h12v7" strokeWidth="2" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" strokeWidth="2" />
      <path d="M6 14h12v8H6z" strokeWidth="2" />
    </svg>
  );
}
function ReloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M21 12a9 9 0 1 1-3-6.7" strokeWidth="2" />
      <path d="M21 3v6h-6" strokeWidth="2" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 20h9" strokeWidth="2" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeWidth="2" />
    </svg>
  );
}
function DeleteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <polyline points="3 6 5 6 21 6" strokeWidth="2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeWidth="2" />
      <path d="M10 11v6M14 11v6" strokeWidth="2" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" strokeWidth="2" />
    </svg>
  );
}
function AddIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 5v14M5 12h14" strokeWidth="2" />
    </svg>
  );
}

const STORAGE_KEY = 'camel-weigh-entries-v1';
const CHECK_SEQ_KEY = 'camel-weigh-check-seq';

export default function Page() {
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [form, setForm] = useState(() => ({
    checkNo: '',
    plateNumber: '',
    yukBilan: '',
    yuksiz: '',
    sofVazin: '',
    date: new Date().toISOString().slice(0, 10),
    rate: '30000'
  }));

  const audioRef = useRef(null);
  useEffect(() => {
    // Load theme
    const saved = localStorage.getItem('camel-theme-dark');
    if (saved) setDark(saved === '1');
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setEntries(data);
    const nextNo = Number(localStorage.getItem(CHECK_SEQ_KEY) || '1');
    setForm(f => ({ ...f, checkNo: nextNo.toString() }));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('camel-theme-dark', dark ? '1' : '0');
  }, [dark]);

  // Auto-calc Sof Vazin
  useEffect(() => {
    const yb = Number(form.yukBilan || 0);
    const yz = Number(form.yuksiz || 0);
    const net = yb - yz;
    setForm(f => ({ ...f, sofVazin: Number.isFinite(net) ? String(net) : '' }));
  }, [form.yukBilan, form.yuksiz]);

  // Alarm: net negative or very large
  useEffect(() => {
    const net = Number(form.sofVazin || 0);
    if (!alarmEnabled) return;
    if (net < 0 || net > 40000) {
      try {
        if (!audioRef.current) {
          const audio = new Audio();
          // generate beep via data URI
          audio.src =
            'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAACAAACaGZmZmZmZmZm'; // very short click
          audioRef.current = audio;
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      } catch {}
    }
  }, [form.sofVazin, alarmEnabled]);

  // Derived: filtered entries
  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.trim().toLowerCase();
    return entries.filter(e =>
      Object.values(e).some(v => String(v).toLowerCase().includes(q))
    );
  }, [entries, search]);

  function persist(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setEntries(next);
  }
  function nextCheckNo() {
    const n = Number(localStorage.getItem(CHECK_SEQ_KEY) || '1');
    localStorage.setItem(CHECK_SEQ_KEY, String(n + 1));
    return n;
  }

  function resetForm() {
    const nextNo = Number(localStorage.getItem(CHECK_SEQ_KEY) || '1');
    setForm({
      checkNo: String(nextNo),
      plateNumber: '',
      yukBilan: '',
      yuksiz: '',
      sofVazin: '',
      date: new Date().toISOString().slice(0, 10),
      rate: '30000'
    });
    setEditingId(null);
  }

  function onSubmit(e) {
    e.preventDefault();
    const yb = Number(form.yukBilan || 0);
    const yz = Number(form.yuksiz || 0);
    const net = yb - yz;
    const price = net * Number(form.rate);
    if (editingId) {
      const next = entries.map(en => (en.id === editingId ? {
        ...en,
        plateNumber: form.plateNumber.trim(),
        yukBilan: yb,
        yuksiz: yz,
        sofVazin: net,
        date: form.date,
        rate: Number(form.rate),
        price
      } : en));
      persist(next);
      resetForm();
      return;
    }
    const id = crypto.randomUUID();
    const checkNo = nextCheckNo();
    const record = {
      id,
      checkNo,
      plateNumber: form.plateNumber.trim(),
      yukBilan: yb,
      yuksiz: yz,
      sofVazin: net,
      date: form.date,
      rate: Number(form.rate),
      price
    };
    persist([record, ...entries]);
    resetForm();
  }

  function onEdit(id) {
    const row = entries.find(e => e.id === id);
    if (!row) return;
    setEditingId(id);
    setForm({
      checkNo: String(row.checkNo),
      plateNumber: row.plateNumber,
      yukBilan: String(row.yukBilan),
      yuksiz: String(row.yuksiz),
      sofVazin: String(row.sofVazin),
      date: row.date,
      rate: String(row.rate)
    });
  }
  function onDelete(id) {
    const next = entries.filter(e => e.id !== id);
    persist(next);
    if (editingId === id) resetForm();
  }

  function printPage() {
    window.print();
  }
  function reloadData() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setEntries(data);
  }

  function highlight(text, q) {
    if (!q) return text;
    const idx = String(text).toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {String(text).slice(0, idx)}
        <span className="highlight">{String(text).slice(idx, idx + q.length)}</span>
        {String(text).slice(idx + q.length)}
      </>
    );
  }

  return (
    <>
      <div className="bg-hero" />
      <div className="bg-overlay" />
      <div className="container">
        <div className="topbar">
          <div className="brand">
            <img className="logo" src="/camel-logo.svg" alt="Camel" />
            <span>Camel Weigh Station</span>
          </div>
          <div className="controls hidden-print">
            <div className="search">
              <SearchIcon />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
              />
              <button
                className="btn secondary icon"
                title="Toggle dark mode"
                onClick={() => setDark(v => !v)}
              >
                <MoonIcon filled={dark} /> Theme
              </button>
            </div>
            <button className="btn icon" onClick={printPage}><PrintIcon /> Print</button>
            <button className="btn secondary icon" onClick={reloadData}><ReloadIcon /> Reload</button>
          </div>
        </div>

        <div className="section card">
          <form onSubmit={onSubmit}>
            <div className="grid">
              <div className="field">
                <label>Check No</label>
                <input value={form.checkNo} onChange={()=>{}} readOnly />
              </div>
              <div className="field" style={{ gridColumn: 'span 2' }}>
                <label>Plate Number</label>
                <input
                  value={form.plateNumber}
                  onChange={e => setForm(f => ({ ...f, plateNumber: e.target.value }))}
                  placeholder="e.g. 01 A 234 BC"
                  required
                />
              </div>
              <div className="field">
                <label>Yuk bilan (Kg)</label>
                <input
                  type="number"
                  value={form.yukBilan}
                  onChange={e => setForm(f => ({ ...f, yukBilan: e.target.value }))}
                  placeholder="e.g. 42000"
                  required
                />
              </div>
              <div className="field">
                <label>Yuksiz (Kg)</label>
                <input
                  type="number"
                  value={form.yuksiz}
                  onChange={e => setForm(f => ({ ...f, yuksiz: e.target.value }))}
                  placeholder="e.g. 12000"
                  required
                />
              </div>
              <div className="field">
                <label>Sof Vazin (Kg)</label>
                <input type="number" value={form.sofVazin} readOnly />
              </div>
              <div className="field">
                <label>Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="field">
                <label>Price Rate</label>
                <select value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))}>
                  <option value="30000">30,000</option>
                  <option value="40000">40,000</option>
                </select>
              </div>
              <div className="field">
                <label className="muted">Alarm</label>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setAlarmEnabled(v => !v)}
                  title="Active alarm"
                >
                  {alarmEnabled ? 'Alarm: ON' : 'Alarm: OFF'}
                </button>
              </div>
              <div className="field" style={{ alignSelf: 'end' }}>
                <button className="btn icon" type="submit">
                  <AddIcon /> {editingId ? 'Save' : 'Add'}
                </button>
              </div>
              {Number(form.sofVazin || 0) < 0 || Number(form.sofVazin || 0) > 40000 ? (
                <div className="field" style={{ gridColumn: '1 / -1' }}>
                  <div className="alarm">
                    Weight out of expected range. Please verify measurements.
                  </div>
                </div>
              ) : null}
            </div>
          </form>
        </div>

        <div className="section card">
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Check_No</th>
                  <th>Plate_Number</th>
                  <th>Yuk_bilan</th>
                  <th>Sana (Date)</th>
                  <th>Yuksiz</th>
                  <th>Sof_Vazin</th>
                  <th>Price</th>
                  <th className="hidden-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => {
                  const q = search.trim();
                  const price = row.price;
                  return (
                    <tr key={row.id}>
                      <td>{highlight(row.checkNo, q)}</td>
                      <td>{highlight(row.plateNumber, q)}</td>
                      <td>{highlight(row.yukBilan, q)}</td>
                      <td>{highlight(row.date, q)}</td>
                      <td>{highlight(row.yuksiz, q)}</td>
                      <td>{highlight(row.sofVazin, q)}</td>
                      <td>{highlight(price.toLocaleString(), q)}</td>
                      <td className="hidden-print">
                        <div className="row-actions">
                          <button className="btn secondary icon" onClick={() => onEdit(row.id)} title="Edit">
                            <EditIcon /> Edit
                          </button>
                          <button className="btn danger icon" onClick={() => onDelete(row.id)} title="Delete">
                            <DeleteIcon /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="muted">No records.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

