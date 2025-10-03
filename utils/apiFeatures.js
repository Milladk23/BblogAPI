class ApiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    fillter() {
        const queryObj = {};

        if(this.queryString.author) {
            queryObj.author = this.queryString.author;
        }
        if(this.queryString.category) {
            queryObj.category = this.queryString.category;
        }

        if(this.queryString.tags) {
            queryObj.tags = this.queryString.tags;
        }

        if(this.queryString.search) {
            queryObj.$or = [
                { title: { $regex: `.*${this.queryString.search}.*`, $options: 'i' } },
                { content: { $regex: `.*${this.queryString.search}.*`, $options: 'i' } },
            ];
        }

        this.query = this.query.find(queryObj);

        return this;
    }
    sort() {
        if(this.query.sort) {
            this.query.sort('likes');
        } else {
            this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if(this.query.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query.select('-__v');
        }
        return this;
    }
    paginate() {
        const page = +this.queryString.page || 1;
        const limit = Math.min(+this.queryString.limit || 100, 1000);
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;

    }
}

export default ApiFeatures;