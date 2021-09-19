module.exports = func => {
    return (req, res, next) => {
        // catch and handle the error
        func(req, res, next).catch(next);
    }
}