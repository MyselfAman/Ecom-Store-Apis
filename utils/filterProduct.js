// base - Product.find
// bigQ - seach=coder&pag=2
// &price[lte]=999


class filterProduct{
    constructor(base,bigQ){
        
        this.base = base;
        this.bigQ = bigQ
    }

    

    search(){
        const searchword = this.bigQ.search ? {
            name:{
                $regex : this.bigQ.search,
                $options:'i'
            }
        } :{}
        this.base = this.base.find({...searchword})
        return this;

    }

    pager(resultPerPage){
        let currentPage=1;
        // if page = somevalue exists in query
        if(this.bigQ.page){
            currentPage = this.bigQ.page
        }

        // no of data u wanna show on per page
        const skipVal = resultPerPage *(currentPage-1)

        // to show result per page and skip no of value for next page
        this.base = this.base.limit(resultPerPage).skip(skipVal);
        return this;
    }

    filter(){
        // making a copy of bigQ to do operation on that
        let copyQ = {...this.bigQ};

        // deleting this three from copy of url as their functionalities has been added
        delete copyQ["search"];
        delete copyQ["limit"];
        delete copyQ["page"];
        
        // convert copyQ into a string in order to apply regex and convert it to $lte $gte
        let stringOfCopyQ = JSON.stringify(copyQ);

        // to add $ in front of query operator
        stringOfCopyQ = stringOfCopyQ.replace(/\b(lte|gte|gt|lt)\b/g,m=>`$${m}`)

        const jsonOfCopyQ = JSON.parse(stringOfCopyQ);

        this.base = this.base.find(jsonOfCopyQ)
        return this;

    }
}

module.exports = filterProduct;