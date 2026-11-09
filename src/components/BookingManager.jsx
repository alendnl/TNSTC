import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Terminal, Calendar, MapPin, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { parseCurlCommand } from '../utils/curlParser.js';

export default function BookingManager({ bookings, onUpdateBookings }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [inputName, setInputName] = useState('');
  const [inputCurl, setInputCurl] = useState('');
  const [parseError, setParseError] = useState(null);
  const [parsedPreview, setParsedPreview] = useState(null);

  // Live validation on cURL input change
  const handleCurlChange = (value) => {
    setInputCurl(value);
    setParseError(null);
    if (!value.trim()) {
      setParsedPreview(null);
      return;
    }

    try {
      const parsed = parseCurlCommand(value);
      setParsedPreview(parsed);
      if (!inputName.trim()) {
        setInputName(`${parsed.startPlace} → ${parsed.endPlace} (${parsed.bookingDate})`);
      }
    } catch (err) {
      setParseError(err.message);
      setParsedPreview(null);
    }
  };

  const handleOpenAdd = () => {
    setInputName('');
    setInputCurl('');
    setParseError(null);
    setParsedPreview(null);
    setEditingId(null);
    setIsAdding(true);
  };

  const handleOpenEdit = (booking) => {
    setEditingId(booking.id);
    setInputName(booking.name);
    setInputCurl(booking.curlCommand);
    setParseError(null);
    try {
      const parsed = parseCurlCommand(booking.curlCommand);
      setParsedPreview(parsed);
    } catch {
      setParsedPreview(null);
    }
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!inputCurl.trim()) {
      setParseError('cURL command cannot be empty.');
      return;
    }

    try {
      const parsed = parseCurlCommand(inputCurl);
      const updatedItem = {
        id: editingId || `booking-${Date.now()}`,
        name: inputName.trim() || `${parsed.startPlace} → ${parsed.endPlace} (${parsed.bookingDate})`,
        curlCommand: inputCurl.trim(),
        active: true,
        date: parsed.bookingDate,
        route: `${parsed.startPlace} → ${parsed.endPlace}`
      };

      if (editingId) {
        onUpdateBookings(bookings.map((b) => (b.id === editingId ? updatedItem : b)));
      } else {
        onUpdateBookings([...bookings, updatedItem]);
      }

      setIsAdding(false);
      setEditingId(null);
    } catch (err) {
      setParseError(`Invalid cURL: ${err.message}`);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this booking cURL?')) {
      onUpdateBookings(bookings.filter((b) => b.id !== id));
    }
  };

  const handleToggleActive = (id) => {
    onUpdateBookings(
      bookings.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span>List of Bookings (cURLs)</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300">
              {bookings.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure the cURL requests captured from TNSTC. Toggle routes on or off anytime.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add cURL</span>
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-2.5">
        {bookings.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-zinc-800 rounded-xl">
            <Terminal className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-400">No bookings configured</p>
            <p className="text-xs text-zinc-400 mt-1">
              Click &quot;Add cURL&quot; above to paste a booking request from Chrome DevTools.
            </p>
          </div>
        ) : (
          bookings.map((booking) => {
            let metaDate = booking.date;
            let metaRoute = booking.route;

            if (!metaDate || !metaRoute) {
              try {
                const parsed = parseCurlCommand(booking.curlCommand);
                metaDate = parsed.bookingDate;
                metaRoute = `${parsed.startPlace} → ${parsed.endPlace}`;
              } catch {
                // ignore
              }
            }

            return (
              <div
                key={booking.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  booking.active
                    ? 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                    : 'bg-zinc-950/60 border-zinc-900 opacity-60'
                }`}
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(booking.id)}
                      type="button"
                      title={booking.active ? 'Click to disable' : 'Click to enable'}
                      className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        booking.active ? 'bg-emerald-500' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          booking.active ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-sm font-semibold text-zinc-200 truncate">{booking.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        booking.active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {booking.active ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </div>

                  {/* Route & Date Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-zinc-400">
                    {metaRoute && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50 text-zinc-300">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span className="truncate max-w-[200px] sm:max-w-none">{metaRoute}</span>
                      </span>
                    )}
                    {metaDate && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50 text-zinc-300">
                        <Calendar className="w-3 h-3 text-sky-400" />
                        <span>{metaDate}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenEdit(booking)}
                    type="button"
                    title="Edit cURL"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(booking.id)}
                    type="button"
                    title="Delete booking"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal Drawer */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-5 sm:p-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>{editingId ? 'Edit Booking cURL' : 'Add New Booking cURL'}</span>
              </h3>
              <button
                onClick={() => setIsAdding(false)}
                type="button"
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Friendly Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Booking Name / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Trichy to Kilambakkam Friday Night"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* cURL Command Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-300">
                    cURL Command (bash)
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    Copy from Chrome DevTools: Network → Right click &apos;SearchService&apos; → Copy as cURL
                  </span>
                </div>
                <textarea
                  rows={8}
                  placeholder="Paste curl command here (curl --url 'https://www.tnstc.in/OTRSOnline/jqreq.do...' -H '...' ...)"
                  value={inputCurl}
                  onChange={(e) => handleCurlChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
                />
              </div>

              {/* Live Parsing Preview */}
              {parsedPreview && (
                <div className="p-3 rounded-xl bg-zinc-950/70 border border-emerald-500/30 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>cURL Validated Successfully</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-zinc-300">
                    <div>
                      <span className="text-zinc-500">Route: </span>
                      <span className="font-semibold">{parsedPreview.startPlace} → {parsedPreview.endPlace}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Date: </span>
                      <span className="font-semibold text-sky-400">{parsedPreview.bookingDate}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Cookies: </span>
                      <span className={parsedPreview.hasCookie ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                        {parsedPreview.hasCookie ? 'JSESSIONID Present' : 'Missing Cookie Header'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Target: </span>
                      <span className="truncate block font-mono text-[11px] text-zinc-400">{parsedPreview.url}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Parsing Error */}
              {parseError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800 mt-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shadow-sm cursor-pointer"
              >
                {editingId ? 'Save Changes' : 'Add Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

