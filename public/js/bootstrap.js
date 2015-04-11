require.config({
    baseUrl: 'js',
    enforceDefine: true,
    paths: {
        'text': 'vendor/requirejs/text'
    },
    shim: {
        'dropzone': {
            exports: 'Dropzone'
        }
    },
    urlArgs: "bust=" + (new Date()).getTime()
});

define([
    'application',
    'router'
], function (Application, Router) {
    Application.initialize(new Router());
});
