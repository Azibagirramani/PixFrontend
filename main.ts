
/**
 * @description Pixcap test - Frontend Job
 * @author Kelvin Mansi 
 *
 */

interface IEmployee {
    uniqueId: number;
    name: string;
    subordinates: IEmployee[];
}


interface IOsearch {
    supervisor?: IEmployee,
    employee?: IEmployee
}


interface IEmployeeOrgApp {
    ceo: IEmployee;
    /**
    * Moves the employee with employeeID (uniqueId) under a supervisor
    (another employee) that has supervisorID (uniqueId).
    * E.g. move Bob (employeeID) to be subordinate of Georgina
    (supervisorID). * @param employeeID
    * @param supervisorID
    */
    move(employeeID: number, supervisorID: number): void;
    undo(): void;
    redo(): void;

}

// list actions that can be undone and redone
enum Action {
    move = "move",
    undo = "undo",
    redo = "redo"
}

interface Iactions {
    currentEmployee: IEmployee;
    action?: Action;
    previousEmployeeSubordinates?: IEmployee[];
    previousSupervisor?: IEmployee;
    currentSupervisor?: IEmployee;
    index?: number;
}


// Create the application

class EmployeeOrgApp implements IEmployeeOrgApp {
    ceo: IEmployee;
    actions: Iactions[] = [];
    revert: Iactions[] = [];
    callCount: number = 0;
    constructor(ceo: IEmployee) {
        this.ceo = ceo;
    }

    /**
     * undo
     * * this method is used to undo the last action
     * @returns { void }
     * @memberof EmployeeOrgApp
     */
    undo(): void {

        const action: Iactions[] = this.actions;
        let lastAction = [];

        if (action.length < 0) {
            console.log("No actions to undo");
        }


        for (let i = 0; i < action.length; i++) {

            const actionObj: Iactions = action[i];

            if (actionObj.action === Action.move) {
                const currentEmployee: IEmployee = actionObj.currentEmployee;
                const employeeSubordinates: IEmployee[] = actionObj.previousEmployeeSubordinates;
                const previousSupervisor: IEmployee = actionObj.previousSupervisor;
                const newSupervisor: IEmployee = actionObj.currentSupervisor;

                const index: number = newSupervisor.subordinates.indexOf(currentEmployee);

                newSupervisor.subordinates.splice(index, 1);

                previousSupervisor.subordinates.push(currentEmployee);
                if (employeeSubordinates.length > 0) {
                    for (let i = 0; i < employeeSubordinates.length; i++) {
                        const subordinate: IEmployee = employeeSubordinates[i];
                        const index: number = previousSupervisor.subordinates.indexOf(subordinate);
                        previousSupervisor.subordinates.splice(index, 1);
                    }
                }



                for (let i: number = 0; i < employeeSubordinates.length; i++) {
                    currentEmployee.subordinates.push(employeeSubordinates[i]);
                }

                console.log(`------ undoing: ${actionObj.action} ------`);

                console.log(this.ceo.subordinates[3])

                console.log("Undoing previous move", currentEmployee.name, "to", previousSupervisor.name);

                console.log(this.ceo.subordinates[2])

                console.log(`------ undoing: ${actionObj.action} done ------`);

                const _lastAction: Iactions = {
                    previousSupervisor: newSupervisor,
                    currentEmployee,
                    action: Action.undo,
                    previousEmployeeSubordinates: employeeSubordinates,
                    currentSupervisor: previousSupervisor,
                };

                this.actions.push(...lastAction);
                return;
            }

        }
    }

    /**
     * move
     * * this method is used to reply any previous move action
     * @params none
     */
    redo(): void {
        const actions: Iactions[] = this.actions;

        // lets make sure we have something to redo
        if (actions.length < 0) {
            console.log("No actions to redo");
            return;
        }

        const actionObj: Iactions = actions[actions.length - 1];

        if (this.callCount === 1) {

            const previousSupervisor: IEmployee = actionObj.previousSupervisor;
            const currentEmployee: IEmployee = actionObj.currentEmployee;

            this.move(currentEmployee.uniqueId, previousSupervisor.uniqueId);

            console.log("------ redoing move ------");

            console.log(this.ceo.subordinates[3])
            console.log(this.ceo.subordinates[2])

            console.log("------ redoing move ------");
            this.actions.pop();
            return;
        }

    }

    /**
     * 
     * @param entity { IEmployee }
     * @param action { Action }
     * @param index  { number } optional not rquired and unused.
     * @param subordinates { IEmployee[] }
     * @param previousSupervisor { IEmployee }
     * @param newSupervisor { IEmployee }
     */
    done(entity: IEmployee, action: Action, index: number, subordinates?: IEmployee[], previousSupervisor?: IEmployee, newSupervisor?: IEmployee): void {

        let actionObj: Iactions = {
            previousSupervisor,
            previousEmployeeSubordinates: subordinates,
            currentSupervisor: newSupervisor,
            currentEmployee: entity,
            action: action,
            index: index
        }
        this.actions.push(actionObj);
    }


    /**
     * findEmployee
     * * this method is used to find an employee in the tree of employees
     * @param employeeID { number }
     * @param subordinates { IEmployee }
     * @returns { IEmployee }
     */
    findEmployee(employeeID: number, subordinates?: IEmployee): IOsearch {

        let _supervisor: IEmployee | undefined = undefined;

        let currentEmployee: IEmployee = this.ceo;

        let result: IOsearch;



        if (subordinates) {
            currentEmployee = subordinates;
        }

        _supervisor = currentEmployee;

        if (currentEmployee.uniqueId === employeeID) {
            return result = {
                supervisor: _supervisor,
                employee: currentEmployee
            }

        }

        // check for subordinates of currentEmployee and recursively call this method
        for (let i: number = 0; i < currentEmployee.subordinates.length; i++) {
            let subordinate: IEmployee = currentEmployee.subordinates[i];

            if (subordinate.uniqueId === employeeID) {
                result = {
                    supervisor: _supervisor,
                    employee: subordinate
                }

                return result;

            } else {

                if (subordinate.subordinates.length > 0) {
                    const employee = this.findEmployee(employeeID, subordinate);
                    if (employee) {
                        return employee;
                    }

                }
            }

        }
    }

    /**
     * move
     * * this method is used to move an employee to a any assigned supervisor
     * @param employeeID { number }
     * @param supervisorID { number }
     * @returns 
     */
    move(employeeID: number, supervisorID?: number): void {

        console.log("------ initial object tree ------");

        console.log(this.ceo.subordinates[3])
        console.log(this.ceo.subordinates[2])

        console.log("------ initial object tree ------");

        // find employee and their supervisor
        const currentEmployee: IOsearch = this.findEmployee(employeeID);

        const newSupervisor: IEmployee = this.findEmployee(supervisorID).employee;

        let currentEmployeePrevSupervisor: IEmployee;

        let currentEmployeeSubordinates: IEmployee[] = [];

        if (!currentEmployee) return;

        if (currentEmployee && newSupervisor) {

            currentEmployeeSubordinates = currentEmployee.employee.subordinates;
            for (let i: number = 0; i < currentEmployeeSubordinates.length; i++) {
                currentEmployee.supervisor.subordinates.push(currentEmployeeSubordinates[i]);
            }

            const index: number = currentEmployee.supervisor.subordinates.indexOf(currentEmployee.employee);

            currentEmployee.supervisor.subordinates.splice(index, 1);

            currentEmployeePrevSupervisor = currentEmployee.supervisor;

            currentEmployee.employee.subordinates = [];

            newSupervisor.subordinates.push(currentEmployee.employee);

            console.log("------ moving employee to new supervisor ------");

            console.log(this.ceo.subordinates[3])

            console.log("Moving " + currentEmployee.employee.name + " to " + newSupervisor.name);

            console.log(this.ceo.subordinates[2])

            console.log("------ moved employee to new supervisor ------");
        }

        this.done(currentEmployee.employee, Action.move, new Date().getTime(), currentEmployeeSubordinates, currentEmployeePrevSupervisor, newSupervisor);

        this.undo()


        // uncomment this to see the undo action
        // this.redo()

        console.log("------ final object tree ------");
        console.log(this.ceo.subordinates[3])
        console.log(this.ceo.subordinates[2])
        console.log("------ final object tree ------");
    }


}


const ceo: IEmployee = {
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
            subordinates: [
            ]
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

const app = new EmployeeOrgApp(ceo);
app.move(10, 5);
