module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-easy-less");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.initConfig({
        ezless : {
            styles: {
                options : {
                    lessPath : "less",
                    cssPath : "css",
                    verbose: true,
                    compress: false
                }
            }
        },
        watch: {
            styles: {
                files: '**/*.less',
                tasks: ['ezless'],
                options: {
                    interrupt: true
                },
            },
        },
    })

    grunt.registerTask('less-watch', ['watch'])
}
