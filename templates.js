const axios = require('axios');
const ora = require('ora');

module.exports = function(callback){
	/*const spinner = ora('requesting template interface...');
	spinner.start();

	axios
	.get('https://api.github.com/orgs/rongcli-templates/repos')
	.then(res=>{
		if(res.data&&res.data.length){
			spinner.succeed();
			callback&&callback(res.data.map(item => item.name))
		}else{
			spinner.fail();
		}
	})*/

	let templates =  ['rong-ui','bambooshoot']
	callback&&callback(templates)
}