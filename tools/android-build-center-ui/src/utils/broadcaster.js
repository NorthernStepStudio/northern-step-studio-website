let _broadcast = null;

function setBroadcast(fn) {
    _broadcast = fn;
}

function broadcast(payload) {
    try {
        if (_broadcast) _broadcast(payload);
    } catch (e) {
        // swallow
    }
}

module.exports = { setBroadcast, broadcast };
