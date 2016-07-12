class ErrorStore {
    constructor() {
        this.errors = null;
    }

    saveErrors(error) {
        this.errors = error;
    }

    getErrors() {
        if (this.errors) {
            return this.errors;
        }
    }

    destroy() {
        this.errors = null;
    }
}

const erroStore = new ErrorStore();

export {erroStore as default};
