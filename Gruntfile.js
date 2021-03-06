module.exports = function(grunt) {

require("load-grunt-tasks")(grunt);

  // Project configuration.
  grunt.initConfig({
    copy: {
        js: {
            expand: true,
            cwd: './node_modules',
            dest: './public/js/libs/',
            flatten: true,
            filter: 'isFile',
            src: [
                './jquery/dist/jquery.min.js',
                './bootstrap/dist/js/bootstrap.min.js',
                './vue/dist/vue.min.js',
                './vue-resource/dist/vue-resource.min.js',
                './vue-charts/dist/vue-charts.min.js',
                './vue-charts/dist/vue-charts.js',
                './chart.js/dist/Chart.js'  
            ]
        }
    }
  });

  // Load the plugin that provides the "copy" task.
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ['copy']);

};
