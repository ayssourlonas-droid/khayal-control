export default class UUID {

    static getUUID() {
        UUID.assigned = UUID.assigned || new Set();

        let uuid = uuidv4();
        if (!UUID.assigned.has(uuid)) {
            UUID.assigned.add(uuid);
            return uuid;
        } else {
            return UUID.getUUID();
        }
    }
}

// Ref: https://stackoverflow.com/questions/105034/how-to-create-guid-uuid#answer-2117523
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
