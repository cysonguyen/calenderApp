const { EventEmitter2 } = require("eventemitter2");

const sseEmitter = new EventEmitter2({
  wildcard: true,
  maxListeners: 1000,
});
const clients = new Map();

class SSEService {
  static addClient(userID, res) {
    if (!clients.has(userID)) {
      clients.set(userID, []);
    }
    clients.get(userID).push(res);

    const sendEvent = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sseEmitter.on(`notify.${userID}`, sendEvent);

    const heartbeat = setInterval(() => {
      res.write("data: keep-alive\n\n");
    }, 30000);

    res.on("close", () => {
      clearInterval(heartbeat);
      sseEmitter.off(`notify.${userID}`, sendEvent);
      SSEService.removeClient(userID, res);
    });
  }

  static removeClient(userID, res) {
    if (clients.has(userID)) {
      const userClients = clients.get(userID).filter(client => client !== res);
      if (userClients.length > 0) {
        clients.set(userID, userClients);
      } else {
        clients.delete(userID);
      }
    }
  }

  static async sendToUsers(userIDs, data) {
    await Promise.all(userIDs.map(userID => sseEmitter.emitAsync(`notify.${userID}`, data)));
  }
}

module.exports = SSEService;
