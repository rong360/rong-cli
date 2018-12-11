#!/usr/bin/env node
'use strict'

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
						choices: tpls
					}
				]).then(answer => {
					const spinner = ora('正在下载模板...');
				 	spinner.start();
					download(`rongcli-templates/${answer.template}`, project_name, {clone: true}, (err) => {
						if(err){
							spinner.fail();
							console.log(symbols.error, chalk.red(err));
						}else{
							spinner.succeed();
							//更新package.json
							let fileName = `${project_name}/dev/package.json`,
								meta = {
									name: project_name,
									description: answer.description
								}
							if(fs.existsSync(fileName)){
								let content = fs.readFileSync(fileName).toString();
								let result = handlebars.compile(content)(meta);
								fs.writeFileSync(fileName, result);
							}
							//更新config/index.js build Paths
							let configIndex = `${project_name}/dev/config/index.js`,
								configPaths = {
									assetsRoot: '../../release/',
									assetsSubDirectory: 'static',
									assetsPublicPath: '/'
								}
							if(fs.existsSync(configIndex)){
								if(/view\/webapp/.test(projectPath)){
									if(/activity/.test(projectPath)){
										Object.assign(configPaths, {
											assetsRoot: `../../../../../../webroot/static/activity/${project_name}`,
											assetsSubDirectory: './',
											assetsPublicPath: `/static/main/activity/${project_name}`
										})
									}else{
										Object.assign(configPaths, {
											assetsRoot: `../../../../../webroot/static/webapp/rui/m_${project_name}/`,
											assetsSubDirectory: './',
											assetsPublicPath: `/static/main/webapp/rui/m_${project_name}/`
										})
									}
								}
								let configIndexContent = fs.readFileSync(configIndex).toString();
								let configIndexResult = handlebars.compile(configIndexContent)(configPaths);
								fs.writeFileSync(configIndex, configIndexResult);
							}
							console.log(symbols.success, chalk.green('项目初始化完成'));
						}
					})
				})
			})
			
		}else{
			console.log(symbols.error, chalk.red(`${project_name}项目已存在`));
		}
	})

program.parse(process.argv);

