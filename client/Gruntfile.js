module.exports = function(grunt) {
    var typescript = {
        src: ["src/main/typescript/**/*.ts"],
        dest: "target/javascript"
    };

    grunt.initConfig({
        bower: {            
            target: {
                options: {
                    targetDir: "bower_components"
                }                
            }
        },
        
        connect: {
            target: {
                options: {
                    port: 8081
                }
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
    
    grunt.loadNpmTasks("grunt-bower-task");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-tsd");
    grunt.loadNpmTasks("grunt-typescript");

    grunt.registerTask("default", ["connect", "typescript"]);    
    grunt.registerTask("install", ["bower", "tsd"]);
};