module.exports = function( grunt ) {
	grunt.initConfig({
		pkg: grunt.file.readJSON( 'package.json' ),
		release: {
			options: {
				beforeBump: [ 'build' ],
				additionalFiles: [ 'bower.json' ],
				github: {
					repo: 'deepstreamIO/deepstream.io-client-js',
					usernameVar: 'GITHUB_USERNAME',
					passwordVar: 'GITHUB_PASSWORD'
				}
			}
		}
	});

	grunt.loadNpmTasks( 'grunt-release' );
};