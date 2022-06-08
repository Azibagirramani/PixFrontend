// list actions that can be undone and redone
var Action;
(function (Action) {
    Action["move"] = "move";
    Action["undo"] = "undo";
    Action["redo"] = "redo";
})(Action || (Action = {}));
// Create the application
var EmployeeOrgApp = /** @class */ (function () {
    function EmployeeOrgApp(ceo) {
        this.actions = [];
        this.revert = [];
        this.callCount = 0;
        this.ceo = ceo;
    }
    /**
     * undo
     * * this method is used to undo the last action
     * @returns { void }
     * @memberof EmployeeOrgApp
     */
    EmployeeOrgApp.prototype.undo = function () {
        var _a;
        var action = this.actions;
        var lastAction = [];
        if (action.length < 0) {
            console.log("No actions to undo");
        }
        for (var i = 0; i < action.length; i++) {
            var actionObj = action[i];
            if (actionObj.action === Action.move) {
                var currentEmployee = actionObj.currentEmployee;
                var employeeSubordinates = actionObj.previousEmployeeSubordinates;
                var previousSupervisor = actionObj.previousSupervisor;
                var newSupervisor = actionObj.currentSupervisor;
                var index = newSupervisor.subordinates.indexOf(currentEmployee);
                newSupervisor.subordinates.splice(index, 1);
                previousSupervisor.subordinates.push(currentEmployee);
                if (employeeSubordinates.length > 0) {
                    for (var i_1 = 0; i_1 < employeeSubordinates.length; i_1++) {
                        var subordinate = employeeSubordinates[i_1];
                        var index_1 = previousSupervisor.subordinates.indexOf(subordinate);
                        previousSupervisor.subordinates.splice(index_1, 1);
                    }
                }
                for (var i_2 = 0; i_2 < employeeSubordinates.length; i_2++) {
                    currentEmployee.subordinates.push(employeeSubordinates[i_2]);
                }
                console.log("------ undoing: ".concat(actionObj.action, " ------"));
                console.log(this.ceo.subordinates[3]);
                console.log("Undoing previous move", currentEmployee.name, "to", previousSupervisor.name);
                console.log(this.ceo.subordinates[2]);
                console.log("------ undoing: ".concat(actionObj.action, " done ------"));
                var _lastAction = {
                    previousSupervisor: newSupervisor,
                    currentEmployee: currentEmployee,
                    action: Action.undo,
                    previousEmployeeSubordinates: employeeSubordinates,
                    currentSupervisor: previousSupervisor
                };
                (_a = this.actions).push.apply(_a, lastAction);
                return;
            }
        }
    };
    /**
     * move
     * * this method is used to reply any previous move action
     * @params none
     */
    EmployeeOrgApp.prototype.redo = function () {
        var actions = this.actions;
        // lets make sure we have something to redo
        if (actions.length < 0) {
            console.log("No actions to redo");
            return;
        }
        var actionObj = actions[actions.length - 1];
        if (this.callCount === 1) {
            var previousSupervisor = actionObj.previousSupervisor;
            var currentEmployee = actionObj.currentEmployee;
            this.move(currentEmployee.uniqueId, previousSupervisor.uniqueId);
            console.log("------ redoing move ------");
            console.log(this.ceo.subordinates[3]);
            console.log(this.ceo.subordinates[2]);
            console.log("------ redoing move ------");
            this.actions.pop();
            return;
        }
    };
    /**
     *
     * @param entity { IEmployee }
     * @param action { Action }
     * @param index  { number } optional not rquired and unused.
     * @param subordinates { IEmployee[] }
     * @param previousSupervisor { IEmployee }
     * @param newSupervisor { IEmployee }
     */
    EmployeeOrgApp.prototype.done = function (entity, action, index, subordinates, previousSupervisor, newSupervisor) {
        var actionObj = {
            previousSupervisor: previousSupervisor,
            previousEmployeeSubordinates: subordinates,
            currentSupervisor: newSupervisor,
            currentEmployee: entity,
            action: action,
            index: index
        };
        this.actions.push(actionObj);
    };
    /**
     * findEmployee
     * * this method is used to find an employee in the tree of employees
     * @param employeeID { number }
     * @param subordinates { IEmployee }
     * @returns { IEmployee }
     */
    EmployeeOrgApp.prototype.findEmployee = function (employeeID, subordinates) {
        var _supervisor = undefined;
        var currentEmployee = this.ceo;
        var result;
        if (subordinates) {
            currentEmployee = subordinates;
        }
        _supervisor = currentEmployee;
        if (currentEmployee.uniqueId === employeeID) {
            return result = {
                supervisor: _supervisor,
                employee: currentEmployee
            };
        }
        // check for subordinates of currentEmployee and recursively call this method
        for (var i = 0; i < currentEmployee.subordinates.length; i++) {
            var subordinate = currentEmployee.subordinates[i];
            if (subordinate.uniqueId === employeeID) {
                result = {
                    supervisor: _supervisor,
                    employee: subordinate
                };
                return result;
            }
            else {
                if (subordinate.subordinates.length > 0) {
                    var employee = this.findEmployee(employeeID, subordinate);
                    if (employee) {
                        return employee;
                    }
                }
            }
        }
    };
    /**
     * move
     * * this method is used to move an employee to a any assigned supervisor
     * @param employeeID { number }
     * @param supervisorID { number }
     * @returns
     */
    EmployeeOrgApp.prototype.move = function (employeeID, supervisorID) {
        console.log("------ initial object tree ------");
        console.log(this.ceo.subordinates[3]);
        console.log(this.ceo.subordinates[2]);
        console.log("------ initial object tree ------");
        // find employee and their supervisor
        var currentEmployee = this.findEmployee(employeeID);
        var newSupervisor = this.findEmployee(supervisorID).employee;
        var currentEmployeePrevSupervisor;
        var currentEmployeeSubordinates = [];
        if (!currentEmployee)
            return;
        if (currentEmployee && newSupervisor) {
            currentEmployeeSubordinates = currentEmployee.employee.subordinates;
            for (var i = 0; i < currentEmployeeSubordinates.length; i++) {
                currentEmployee.supervisor.subordinates.push(currentEmployeeSubordinates[i]);
            }
            var index = currentEmployee.supervisor.subordinates.indexOf(currentEmployee.employee);
            currentEmployee.supervisor.subordinates.splice(index, 1);
            currentEmployeePrevSupervisor = currentEmployee.supervisor;
            currentEmployee.employee.subordinates = [];
            newSupervisor.subordinates.push(currentEmployee.employee);
            console.log("------ moving employee to new supervisor ------");
            console.log(this.ceo.subordinates[3]);
            console.log("Moving " + currentEmployee.employee.name + " to " + newSupervisor.name);
            console.log(this.ceo.subordinates[2]);
            console.log("------ moved employee to new supervisor ------");
        }
        this.done(currentEmployee.employee, Action.move, new Date().getTime(), currentEmployeeSubordinates, currentEmployeePrevSupervisor, newSupervisor);
        this.undo();
        // uncomment this to see the undo action
        // this.redo()
        console.log("------ final object tree ------");
        console.log(this.ceo.subordinates[3]);
        console.log(this.ceo.subordinates[2]);
        console.log("------ final object tree ------");
    };
    return EmployeeOrgApp;
}());
var ceo = {
    uniqueId: 1,
    name: 'Mark Zuckerberg:',
    subordinates: [
        {
            uniqueId: 2,
            name: 'Sarah Donald',
            subordinates: [
                {
                    uniqueId: 6,
                    name: 'Cassandra Reynolds',
                    subordinates: [
                        {
                            uniqueId: 7,
                            name: 'Bob Saget:',
                            subordinates: [
                                {
                                    uniqueId: 8,
                                    name: 'Tina Teff',
                                    subordinates: [
                                        {
                                            uniqueId: 9,
                                            name: 'Will Turner',
                                            subordinates: []
                                        }
                                    ]
                                }
                            ]
                        },
                    ]
                }
            ]
        },
        {
            uniqueId: 3,
            name: 'Tyler Simpson',
            subordinates: []
        },
        {
            uniqueId: 4,
            name: 'Bruce Willis',
            subordinates: [
                {
                    uniqueId: 10,
                    name: 'Sophie Turner',
                    subordinates: []
                },
                {
                    uniqueId: 15,
                    name: 'New Guy',
                    subordinates: [
                        {
                            uniqueId: 16,
                            name: 'New Guy3',
                            subordinates: []
                        }
                    ]
                }
            ]
        },
        {
            uniqueId: 5,
            name: 'Georgina Flangy',
            subordinates: []
        },
    ]
};
var app = new EmployeeOrgApp(ceo);
app.move(10, 5);
