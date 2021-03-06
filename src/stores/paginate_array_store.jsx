// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

class PaginateArrayStoreClass {
    constructor(array, limit, page) {
        this.getLength = this.getLength.bind(this);

        this.paged = page || 1;
        this.currentArray = array || [];
        this.results = null;
        this.limit = limit;
        this.offset = ((this.paged - 1) * this.limit);
        this.totalPage = Math.ceil(this.getLength() / this.limit);
    }

    init() {
        return this.currentArray.slice(this.offset, (this.paged * this.limit));
    }

    nextPage() {
        if ((this.paged + 1) > this.totalPage) {
            return false;
        }
        this.paged += 1;
        this.offset = ((this.paged - 1) * this.limit);
        return this.currentArray.slice(this.offset, (this.paged * this.limit));
    }

    getLength() {
        return this.currentArray.length;
    }

    prevPage() {
        if ((this.paged - 1) < 1) {
            return false;
        }
        this.paged -= 1;
        this.offset = ((this.paged - 1) * this.limit);
        return this.currentArray.slice(this.offset, (this.paged * this.limit));
    }

    setLimit(limit) {
        this.limit = limit;
    }

    setArray(array) {
        this.currentArray = array;
    }

    getResults() {
        let pagination;
        if (this.currentArray.length < 1) {
            pagination = '0 resultados';
        } else {
            const start = (this.currentArray.length < 1) ? 0 : (this.offset + 1);
            const end = ((this.paged * this.limit) > this.getLength()) ? this.getLength() : (this.paged * this.limit);
            pagination = start + ' al ' + end + ' de ' + this.getLength();
        }
        return pagination;
    }

    reset() {
        this.paged = 1;
        this.offset = ((this.paged - 1) * this.limit);
        this.resetTotalPage();
        return this.init();
    }

    resetTotalPage() {
        this.totalPage = Math.ceil(this.getLength() / this.limit);
    }
}

//const PaginateArrayStore = new PaginateArrayStoreClass();

export {PaginateArrayStoreClass as default};
