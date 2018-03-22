module.exports = {
	tName: function (token) {
		return token.name.call();
	},
	tBalance: function(token, addr) {
		return token.balanceOf.call(addr).toString(10);
	}
};

