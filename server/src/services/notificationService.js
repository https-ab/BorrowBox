import Notification from '../models/Notification.js';
import { emitToUser } from '../socket.js';

/**
 * Persists a notification and pushes it over Socket.IO in real time.
 * @param {Object} data - { user, type, title, body, item?, transaction?, request?, link? }
 */
export async function notify(data) {
  const notification = await Notification.create(data);
  const populated = await notification.populate('item', 'name images');
  emitToUser(String(data.user), 'notification', populated);
  return populated;
}
