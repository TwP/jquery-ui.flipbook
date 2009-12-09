
(function(jq) {

jq.widget('ui.flipbook', {

    _init: function( ) {
        var context = this.element[0];

        this.element
        .addClass('ui-flipbook ui-widget ui-widget-content ui-corner-all ui-helper-clearfix')
        .attr({role: 'flipbook'})
        .append(
            '<div class="ui-flipbook-controls ui-widget-content ui-corner-left">' +
            '    <div class="ui-flipbook-status ui-widget-content ui-corner-all"></div>' +
            '    <div class="ui-flipbook-buttons ui-helper-clearfix">' +
            '        <a class="fg-button ui-state-default fg-button-icon-solo ui-corner-all" title="Prev"><span class="ui-icon ui-icon-seek-prev"></span>Prev</a>' +
            '        <a class="fg-button ui-state-default fg-button-icon-solo ui-corner-all" title="Play"><span class="ui-icon ui-icon-play"></span>Play</a>' +
            '        <a class="fg-button ui-state-default fg-button-icon-solo ui-corner-all" title="Next"><span class="ui-icon ui-icon-seek-next"></span>Next</a>' +
            '    </div>' +
            '    <div class="ui-flipbook-speed"></div>' +
            '    <div class="ui-flipbook-loop fg-buttonset fg-buttonset-single">' +
            '        <button name="Forward" class="fg-button ui-state-default ui-priority-primary ui-corner-top ui-state-active">Forward</button>' +
            '        <button name="Reverse" class="fg-button ui-state-default ui-priority-primary">Reverse</button>' +
            '        <button name="Bounce" class="fg-button ui-state-default ui-priority-primary ui-corner-bottom">Bounce</button>' +
            '    </div>' +
            '    <ul class="ui-flipbook-indicators ui-helper-clearfix"></ul>' +
            '</div>' +
            '<div class="ui-flipbook-images ui-widget-content ui-corner-right" style="width:500px;height:375px;">' +
            '</div>'
        );

        // slider for animation speed
        jq('.ui-flipbook-speed', context).slider({
            min: 1,
            max: 100,
            range: 'min'
        });

        // all hover and mousedown/up logic for buttons
        jq('.fg-button:not(.ui-state-disabled)', context)
        .hover(
            function(){
                jq(this).addClass('ui-state-hover');
            },
            function(){
                jq(this).removeClass('ui-state-hover');
            }
        )
        .mousedown(function(){
                jq(this).parents('.fg-buttonset-single:first').find('.fg-button.ui-state-active').removeClass('ui-state-active');
                if( jq(this).is('.ui-state-active.fg-button-toggleable, .fg-buttonset-multi .ui-state-active') ){ jq(this).removeClass('ui-state-active'); }
                else { jq(this).addClass('ui-state-active'); }
        })
        .mouseup(function(){
            if(! jq(this).is('.fg-button-toggleable, .fg-buttonset-single .fg-button,  .fg-buttonset-multi .fg-button') ){
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
    }

});

jq.extend(jq.ui.flipbook, {
  version: '0.0.0',
  defaults: {
    delay: 500,
    planningTimes: [11, 13, 15]
  }
});

})(jQuery);

