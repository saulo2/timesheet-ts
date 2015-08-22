module.exports = function(grunt) {
    var typescript = {
        src: ["src/main/typescript/**/*.ts"],
        dest: "target/javascript"
    };

    grunt.initConfig({
        concurrent: {
            target: {
                options: {
                    logConcurrentOutput: true
                },
                tasks: ["nodemon", "typescript:watch"]                
            }
        },

        nodemon: {
            target: {
                script: typescript.dest + "/impl.js"
            }
        },

        tsd: {
            target: {
                options: {
                    config: "tsd.json",
                    command: "reinstall"
                }
            }
        },

        typescript: {
            options: {
                module: "commonjs",
                noImplicitAny: "true"
            },
            target: {
                src: typescript.src,
                dest: typescript.dest
            },
            watch: {
                options: {
                    watch: true
                },
                src: typescript.src,
                dest: typescript.dest
            }
        }
    });

    grunt.loadNpmTasks("grunt-concurrent");
    grunt.loadNpmTasks("grunt-nodemon");
    grunt.loadNpmTasks("grunt-tsd");
    grunt.loadNpmTasks("grunt-typescript");

    grunt.registerTask("default", ["typescript:target", "concurrent"]);
    grunt.registerTask("install", ["tsd"]);
};