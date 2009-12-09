
(function(jq) {

jq.widget('ui.flipbook', {

    _init: function( ) {
        var self = this,
            o = this.options,
            context = this.element[0];

        this.element
        .addClass('ui-fb ui-widget ui-widget-content ui-corner-all ui-helper-clearfix')
        .attr('role','flipbook')
        .append(
            '<div class="ui-fb-controls ui-widget-content ui-corner-left">' +
            '    <div class="ui-fb-status ui-widget-content ui-corner-all"></div>' +
            '    <div class="ui-fb-buttons ui-helper-clearfix">' +
            '        <a class="ui-fb-button ui-state-default ui-fb-button-icon-solo ui-corner-all" title="Prev"><span class="ui-icon ui-icon-seek-prev"></span>Prev</a>' +
            '        <a class="ui-fb-button ui-state-default ui-fb-button-icon-solo ui-corner-all" title="Play"><span class="ui-icon ui-icon-play"></span>Play</a>' +
            '        <a class="ui-fb-button ui-state-default ui-fb-button-icon-solo ui-corner-all" title="Next"><span class="ui-icon ui-icon-seek-next"></span>Next</a>' +
            '    </div>' +
            '    <div class="ui-fb-speed"></div>' +
            '    <div class="ui-fb-loop ui-fb-buttonset ui-fb-buttonset-single">' +
            '        <button name="Forward" class="ui-fb-button ui-state-default ui-priority-primary ui-corner-top ui-state-active">Forward</button>' +
            '        <button name="Reverse" class="ui-fb-button ui-state-default ui-priority-primary">Reverse</button>' +
            '        <button name="Bounce" class="ui-fb-button ui-state-default ui-priority-primary ui-corner-bottom">Bounce</button>' +
            '    </div>' +
            '    <ul class="ui-fb-indicators ui-helper-clearfix"></ul>' +
            '</div>' +
            '<div class="ui-fb-images ui-widget-content ui-corner-right" style="width:500px;height:375px;">' +
            '</div>'
        );

        // slider for animation speed
        jq('.ui-fb-speed', context).slider({
            min: 1,
            max: this.options.maxFrameRate,
            value: 8,
            range: 'min',
            change: function(event, ui) { self._delay(ui.value) }
        });

        // all hover and mousedown/up logic for buttons
        jq('.ui-fb-button:not(.ui-state-disabled)', context)
        .hover(
            function(){
                jq(this).addClass('ui-state-hover');
            },
            function(){
                jq(this).removeClass('ui-state-hover');
            }
        )
        .mousedown(function(){
                jq(this).parents('.ui-fb-buttonset-single:first').find('.ui-fb-button.ui-state-active').removeClass('ui-state-active');
                if( jq(this).is('.ui-state-active.ui-fb-button-toggleable, .ui-fb-buttonset-multi .ui-state-active') ){ jq(this).removeClass('ui-state-active'); }
                else { jq(this).addClass('ui-state-active'); }
        })
        .mouseup(function(){
            if(! jq(this).is('.ui-fb-button-toggleable, .ui-fb-buttonset-single .ui-fb-button,  .ui-fb-buttonset-multi .ui-fb-button') ){
                jq(this).removeClass('ui-state-active');
            }
        });

        jq('a[title=Play]', context).click(function() {
            console.log('play');
        });
        jq('a[title=Prev]', context).click(function() {
            console.log('prev');
        });
        jq('a[title=Next]', context).click(function() {
            console.log('next');
        });


        jq('button[name=Forward]', context).click(function() {
            console.log('forward');
        });
        jq('button[name=Reverse]', context).click(function() {
            console.log('reverse');
        });
        jq('button[name=Bounce]', context).click(function() {
            console.log('bounce');
        });


        this._delay(jq('.ui-fb-speed', context).slider('value'));
    },

    destroy: function() {
        this.element
        .removeClass('ui-fb ui-widget ui-widget-content ui-corner-all ui-helper-clearfix')
        .removeAttr('role','flipbook')
        .removeData('flipbook')
        .empty();
    },

    _delay: function( frameRate ) {
        this.delay = 1 / frameRate * 1000;
    },

    _next: function() { },
    _prev: function() { }

});

jq.extend(jq.ui.flipbook, {
  version: '0.0.0',
  defaults: {
    images: [],
    maxFrameRate: 24
  }
});

})(jQuery);

