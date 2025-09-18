module.exports = (fn) => {
  return (req, res, next) => {
    //catch next is the same as catch(err)=> next (err)
    //this error will end up in our global error handling middleware
    return fn(req, res, next).catch(next);
  };
};
