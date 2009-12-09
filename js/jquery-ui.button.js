

/**
 *
 */
var button = function( options ) {
  options = $.extend({
    text: 'Push Me',
    icon: null,
    iconSide: 'right',
    disabled: false,
    click: null
  }, options);

  var b = button.init(options);

  if (options.click) {
    b.data('click-function', options.click);
  }

  if (options.disabled) {
    button.disable(b);
  } else {
    button.enable(b);
  }

  return b;
};

$.extend(button, {

  init: function( options ) {
    if (options.icon) {
      return $('<a class="fg-button ui-state-default ui-corner-all"></a>')
      .addClass('fg-button-icon-' + options.iconSide)
      .text(options.text)
      .prepend($('<span class="ui-icon ui-icon-' + options.icon + '"></span>'));
    } else {
      return $('<button class="fg-button ui-state-default ui-corner-all"></button>')
      .text(options.text);
    }
  },

  enable: function( button ) {
    button
    .removeClass('ui-state-disabled')
    .bind('mouseenter.button', function(){ 
        $(this).addClass("ui-state-hover"); 
    })
    .bind('mouseleave.button', function(){ 
        $(this).removeClass("ui-state-hover"); 
    })
    .bind('mousedown.button', function(){
        $(this).parents('.fg-buttonset-single:first').find(".fg-button.ui-state-active").removeClass("ui-state-active");
        if( $(this).is('.ui-state-active.fg-button-toggleable, .fg-buttonset-multi .ui-state-active') ){ $(this).removeClass("ui-state-active"); }
        else { $(this).addClass("ui-state-active"); }   
    })
    .bind('mouseup.button', function(){
      if(! $(this).is('.fg-button-toggleable, .fg-buttonset-single .fg-button,  .fg-buttonset-multi .fg-button') ){
        $(this).removeClass("ui-state-active");
      }
    });

    if (button.data('click-function')) {
      button.bind('click.button', button.data('click-function'));
    }
  },

  disable: function( button ) {
    button
    .addClass('ui-state-disabled')
    .unbind('.button');
  }

});
