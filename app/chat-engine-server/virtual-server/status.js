class Status {
  constructor(status = {}) {
    Object.entries(status).forEach(([key, value]) => this[key] = value);
  }

  hasChanges(newStatus) {
    if (!newStatus) {
      return Object.entries(this).some(([key, value]) => value !== undefined);
    }
    let result = Object.keys(newStatus).some((key) => this[key] !== newStatus[key]);
    result = result || Object.keys(newStatus).length !== Object.keys(this).length;
    return result;
  }

  update(status) {
    if (!this.hasChanges(status)) {
      return false;
    }
    if (status) {
      Object.keys(this).forEach((key) => this[key] = undefined);
      Object.entries(status).forEach(([key, value]) => this[key] = value);
    } else {
      Object.keys(this).forEach((key) => this[key] = undefined);
    }
    return true;
  }
}

module.exports = Status;
