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

    addDomain(companyId, domain) {
        const currentCompany = this.getCurrent();
        const company = this.getCompanyById(companyId);

        if (currentCompany && currentCompany.id === companyId) {
            currentCompany.domains.push(domain);

            if (company) {
                this.companies[companyId] = currentCompany;
            }
        } else if (company) {
            company.domains.push(domain);
        }
    }

    addDomainAdmins(companyId, domain) {
        function findDomain(company) {
            const domains = company.domains;
            let index = -1;

            if (domains) {
                domains.forEach((d, i) => {
                    if (d.id === domain.id) {
                        index = i;
                        return false;
                    }
                    return true;
                });
            }

            return index;
        }

        function replaceDomain(company, index) {
            if (index >= 0) {
                company.domains[index] = domain;
            } else {
                company.domains.push(domain);
            }
        }

        const currentCompany = this.getCurrent();
        const company = this.getCompanyById(companyId);
        let index = -1;

        if (currentCompany && currentCompany.id === companyId) {
            index = findDomain(currentCompany);

            replaceDomain(currentCompany, index);

            if (company) {
                this.companies[companyId] = currentCompany;
            }
        } else if (company) {
            index = findDomain(company);

            replaceDomain(company, index);
        }
    }
}

const CompanyStore = new CompanyStoreClass();

export {CompanyStore as default};
