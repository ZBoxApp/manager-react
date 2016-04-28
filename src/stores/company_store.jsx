// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

class CompanyStoreClass {
    constructor() {
        this.current = null;
        this.companies = null;
    }

    getCompanies() {
        const array = [];
        const companies = this.companies;

        if (!companies) {
            return null;
        }

        for (const id in companies) {
            if (companies.hasOwnProperty(id)) {
                array.push(companies[id]);
            }
        }

        return array;
    }

    getCompanyById(id) {
        if (!this.companies) {
            return null;
        }
        return this.companies[id];
    }

    getCurrent() {
        return this.current;
    }

    setCompanies(companiesArray) {
        const companies = {};

        companiesArray.forEach((c) => {
            companies[c.id] = c;
        });

        this.companies = companies;
    }

    setCurrent(company) {
        this.current = company;
    }
}

const CompanyStore = new CompanyStoreClass();

export {CompanyStore as default};
