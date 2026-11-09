// Centralized state persistence using MongoDB for cross-device sync (Laptop <-> Mobile)
// Reads and writes to a single document (_id: "main_user") in the "config" collection of "tnstc" db.

import { getMainUserState, saveMainUserState } from './mongodb.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const state = await getMainUserState();

      // Check if browser was closed:
      // If state says searching is true, but the last searched timestamp is 1 minute more
      // than the configured time interval, then the browser was closed and searching stopped.
      // Reset isSearching to false and update MongoDB.
      if (state && state.isSearching) {
        const intervalSeconds = Number(state.config?.checkInterval || 60);
        const thresholdMs = (intervalSeconds + 60) * 1000; // interval + 1 minute grace period
        const lastSearched = Number(state.lastSearchTimestamp || 0);
        const elapsed = Date.now() - lastSearched;

        if (lastSearched === 0 || elapsed > thresholdMs) {
          state.isSearching = false;
          await saveMainUserState(state);
        }
      }

      return res.status(200).json({
        success: true,
        hasServerState: Boolean(state),
        state: state || null
      });
    } catch (err) {
      console.error('Error fetching state from MongoDB:', err.message);
      return res.status(500).json({ error: 'Failed to fetch state from MongoDB', message: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { state } = req.body || {};
      if (!state) {
        return res.status(400).json({ error: 'Missing state payload' });
      }

      await saveMainUserState(state);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error saving state to MongoDB:', err.message);
      return res.status(500).json({ error: 'Failed to save state to MongoDB', message: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
