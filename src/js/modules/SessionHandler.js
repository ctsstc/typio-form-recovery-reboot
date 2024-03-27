const SessionHandler = {
  _globalSessionId: null,

  refreshGlobalSessionId() {
    SessionHandler._globalSessionId = SessionHandler.generateSessionId();
  },

  getGlobalSessionId: () => {
    return SessionHandler._globalSessionId;
  },

  generateSessionId() {
    return Math.round(Date.now() / 1000) + "";
  },
};

SessionHandler.refreshGlobalSessionId();

export default SessionHandler;
