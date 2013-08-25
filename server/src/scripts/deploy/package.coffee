utils = require '../../common/utils'
compressor = require('node-minify')

if process.argv.length > 2
    opt = process.argv[2]
    utils.log "Options: #{process.argv[2]}"

if opt isnt '--debug' and opt isnt '--trace'

    utils.log "Minifying JS and CSS..."
    
    c = new compressor.minify {
        #type: 'no-compress',
        type: 'sqwish',
        buffer: 1000 * 1024,
        tempPath: '../temp/',
        fileIn: [
            'app/www/lib/font-awesome/css/font-awesome.css',
            'app/www/css/HINT.css',
            'app/www/css/toggle-switch.css'
        ],
        fileOut: 'app/www/css/lib.css',
        callback: (err) -> 
            if err
                utils.log(err)
            else
                utils.log 'Created lib.css'
    }    
    
    c = new compressor.minify {
        #type: 'no-compress',
        type: 'sqwish',
        buffer: 1000 * 1024,
        tempPath: '../temp/',
        fileIn: [
            'app/www/css/main.css'
        ],
        fileOut: 'app/www/css/fora.css',
        callback: (err) -> 
            if err
                utils.log(err)
            else
                utils.log 'Created fora.css'
    }    

    #Already minified.
    c = new compressor.minify {
        type: 'no-compress',
        buffer: 1000 * 1024,
        tempPath: '../temp/',
        fileIn: [
            'app/www/js/lib/jquery-min.js', 
            'app/www/js/lib/angular-min.js'
        ],
        fileOut: 'app/www/js/lib-base.js',
        callback: (err) -> 
            if err
                utils.log(err)
            else
                utils.log 'Created lib-base.js'
    }    
    
    #type: 'uglifyjs', Using no compress until errors are resolved in uglify due to node 0.11
    c = new compressor.minify {
        type: 'no-compress',
        buffer: 1000 * 1024,
        tempPath: '../temp/',
        fileIn: [
            'app/www/js/lib/jquery-cookie.js',
            'app/www/js/lib/jquery.modal.js',
            'app/www/lib/bangjs/reMarked.js',            
            'app/www/lib/bangjs/jquery-drags.js',                  
            'app/www/lib/bangjs/bangjs.js',
            'app/www/lib/bangjs/bangjs-toolbar.js',
        ],
        fileOut: 'app/www/js/lib.js',
        callback: (err) -> 
            if err
                utils.log(err)
            else
                utils.log 'Created lib.js'
    }    
    
    c = new compressor.minify {
        type: 'no-compress',
        buffer: 1000 * 1024,
        tempPath: '../temp/',
        fileIn: [
            'app/www/js/views/baseview.js',
            'app/www/js/views/users/selectusername.js'
        ],
        fileOut: 'app/www/js/fora.js',
        callback: (err) -> 
            if err
                utils.log(err)
            else
                utils.log 'Created fora.js'
    }
else
    utils.log "Skipped minify in debug mode."            


