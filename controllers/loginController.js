function login(req, res) {
    res.render('login/index')
}

function storeUser(req, res) {
    const data = req.body;
    console.log(data)
}

module.exports = {
    login,
    storeUser
}