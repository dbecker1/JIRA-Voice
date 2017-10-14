/**
 * Created by dbeckerfl on 10/14/17.
 */

class JIRA {
    constructor() {
        console.log("constructed neww");
    }

    queryAll() {
        return "All issues: ";
    }

    setValue(issue, field, value) {
        return "Set " + field + " to " + value + " in issue " + issue;
    }

    authenticate(username, password) {
        return "Authenticated";
    }
}
exports.JIRA = JIRA;
