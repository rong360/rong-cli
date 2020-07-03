#!/usr/bin/env node
'use strict'

/**
 * rong-cli
 * 本地调试：进入根目录 npm install, 执行node index.js create projectName
 */

const program = require('commander');
const download = require('download-git-repo');
const inquirer = require('inquirer');
const symbols = require('log-symbols');
const chalk = require('chalk');
const ora = require('ora');
const handlebars = require('handlebars');
const fs = require('fs')
const templates = require("./templates.js")

program
	.version(require('./package').version )
	.command('create <project_name>')
	.action(project_name => {
		let projectPath = process.cwd() + '/' + project_name
		if(!fs.existsSync(projectPath)){
			templates(tpls => {
				inquirer.prompt([
					{
						type: 'input',
						name: 'description',
						message: 'please input project description'
					},
					{
						type: 'list',
						name: 'template',
						message: 'which template do you need:',
						choices: tpls.sort()
					}
				]).then(answer => {
					const spinner = ora(`downloading ${answer.template} template...`);
				 	spinner.start();
					//download(`rongcli-templates/${answer.template}`, project_name, {clone: true}, (err) => {
					//download(`gitlab:gitlab.rong360.com:rongcli-templates/${answer.template}`, project_name, {clone: true}, (err) => {
					download(`https://gitlab.rong360.com:rongcli-templates/${answer.template}`, project_name, {clone: true}, (err) => {
						if(err){
							spinner.fail();
							console.log(symbols.error, chalk.red(err));
						}else{
							spinner.succeed();
							//更新package.json
							let fileName = `${project_name}/dev/package.json`,
							  fileName2 = `${project_name}/package.json`,
								meta = {
									name: project_name,
									description: answer.description
								}
							if(fs.existsSync(fileName)){
								let content = fs.readFileSync(fileName).toString();
								let result = handlebars.compile(content)(meta);
								fs.writeFileSync(fileName, result);
							}else if(fs.existsSync(fileName2)){
								let content = fs.readFileSync(fileName2).toString();
								let result = handlebars.compile(content)(meta);
								fs.writeFileSync(fileName2, result);
							}
							//更新config/index.js build Paths
							let configIndexFile = '',
								configPaths = {
									assetsRoot: '../../release/',
									assetsSubDirectory: 'static',
									assetsPublicPath: '/'
								},
								isExistConfigIndexFile = false , // 下载的模板中是否存在 config/index.js 文件
								isProjectInViewWebapp = /view\/webapp/.test(projectPath) // 创建项目是否在view webapp目录下
							if (fs.existsSync(`${project_name}/dev/config/index.js`)) {
								configIndexFile = `${project_name}/dev/config/index.js`
								isExistConfigIndexFile = true
							} else if (fs.existsSync(`${project_name}/config/index.js`)) {
								configIndexFile = `${project_name}/config/index.js`
								isExistConfigIndexFile = true
							}
							if(isExistConfigIndexFile){
								if(isProjectInViewWebapp){
									if(/activity/.test(projectPath)){ // 活动页模板
										Object.assign(configPaths, {
											assetsRoot: `../../../../../../webroot/static/activity/${project_name}/`,
											assetsSubDirectory: './',
											assetsPublicPath: `/static/main/activity/${project_name}/`
										})
									}else{
										Object.assign(configPaths, {
											assetsRoot: `../../../../../webroot/static/webapp/rui/m_${project_name}/`,
											assetsSubDirectory: './',
											assetsPublicPath: `/static/main/webapp/rui/m_${project_name}/`
										})
									}
								}
								let configIndexContent = fs.readFileSync(configIndexFile).toString();
								let configIndexResult = handlebars.compile(configIndexContent)(configPaths);
								fs.writeFileSync(configIndexFile, configIndexResult);
							}

							console.log(symbols.success, chalk.green(`project ${project_name} was created successfully`));

							console.log('\r\n')
							console.log('***************************')
							console.log(` cd ${project_name}        `)
							if (fs.existsSync(fileName)) {
								console.log(` cd dev                  `)
							}
							if(!isProjectInViewWebapp && isExistConfigIndexFile){
								console.log(symbols.warning, chalk.green(`不能识别静态资源产出路径，请进入config/index.js设置 build->assetsRoot、assetsSubDirectory和assetsPublicPath,例如：`))
								console.log(chalk.green(` assetsRoot: path.resolve(__dirname, '../../../../../webroot/static/webapp/rui/m_tjy/'),`))
								console.log(chalk.green(` assetsSubDirectory: 'static',`))
								console.log(chalk.green(` assetsPublicPath: '/static/main/webapp/rui/m_tjy/',`))
							}
							console.log(` npm install               `)
							console.log(` npm run dev               `)
							console.log('***************************')
						}
					})
				})
			})
			
		}else{
			console.log(symbols.error, chalk.red(`${project_name}项目已存在`));
		}
	})

program.parse(process.argv);

