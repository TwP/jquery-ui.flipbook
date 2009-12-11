
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
            '        <a class="ui-fb-button ui-state-default ui-fb-button-icon-solo ui-corner-all" title="Play"><span class="ui-icon ui-icon-play"></span>Play or Pause</a>' +
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
            '<div class="ui-fb-images ui-widget-content ui-corner-right">' +
            '  <div class="ui-fb-loader" style="display:none;"><div class="ui-widget-overlay ui-corner-all"></div>Loading ... <span></span></div>' +
            '</div>'
        );

/*
        var $buttons = jq('.ui-fb-buttons', context).css('float','left'),
            width = $buttons.outerWidth();
        $buttons.css({float: 'none', width: width+2});
        jq('.ui-fb-loop', context).css('width', width);
*/
        this.images = jq('.ui-fb-images', context);
        this.indicators = jq('ul.ui-fb-indicators', context)
        .bind('click', function(e) {
            if (o.disabled) return;
            if (e.target.nodeName !== 'LI') return;
            jq(e.target).toggleClass('ui-state-disabled');
        });

        // slider for animation speed
        jq('.ui-fb-speed', context).slider({
            min: 2,
            max: 40,
            value: 32,
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

        this.playPause = jq('a[title=Play]', context).click(function() { self._startStop() });
        jq('a[title=Prev]', context).click(function() { self._activate(self.stop().prev()) });
        jq('a[title=Next]', context).click(function() { self._activate(self.stop().next()) });

        jq('button[name=Forward]', context).click(function() { self._direction('forward') });
        jq('button[name=Reverse]', context).click(function() { self._direction('reverse') });
        jq('button[name=Bounce]', context).click(function() { self._direction('bounce') });

        this._delay(jq('.ui-fb-speed', context).slider('value'));
        this._imageList = [];
        this.direction = 'forward';

        this._setData('images', o.images);
    },

    destroy: function() {
        this.element
        .removeClass('ui-fb ui-widget ui-widget-content ui-corner-all ui-helper-clearfix')
        .removeAttr('role','flipbook')
        .removeData('flipbook')
        .empty();
    },

    _setData: function( key, value ) {
        jq.widget.prototype._setData.apply(this, arguments);

        switch (key) {
            case 'images':
                if (value && value.length > 0) this.stop()._load();
                break;
        }
    },

    _load: function() {
        var self = this,
            obj = null;

        $('.ui-fb-loader', this.element[0]).show();
        this.options.disabled = true;
        this.images.find('img').remove();
        this._imageList.length = 0;
        this.indicators.empty();
        this._imageLoadCount = 0;

        jq.each(this.options.images, function(ii, val) {
            obj = {
                image:     jq('<img />').attr('src',val).load(function() {self._imageLoaded(ii)}),
                indicator: jq('<li></li>').addClass('ui-corner-all ui-state-default ui-state-disabled').text(ii+1)
            };
            self._imageList.push(obj);
            self.images.append(obj.image);
            self.indicators.append(obj.indicator);
        });

        return this;
    },

    _imageLoaded: function( index ) {
        this._imageLoadCount++;
        this._imageList[index].indicator.toggleClass('ui-state-disabled');

        if (this._imageLoadCount === 1) {
            var $image = this._imageList[index].image;
            this.images.css({width: $image.width(), height: $image.height()});
            this._activate(index);
            $('.ui-fb-loader', this.element[0]).hide();
            this.start();
        }
        if (this._imageLoadCount === this._imageList.length) this.options.disabled = false;

        return this;
    },

    _activate: function( index ) {
        this.images.find('img').hide();
        this.indicators.find('li').removeClass('ui-state-active');

        var obj = this._imageList[index];
        obj.image.show();
        obj.indicator.addClass('ui-state-active');
        this._active = index;

        return this;
    },

    _delay: function( frameRate ) {
        this.delay = 25 * (42 - frameRate);

        if (this._running) {
            this._stop();
            this._start();
        }
    },

    next: function() {
        var index = this._active,
            found = null,
            list = this._imageList,
            length = list.length;

        do {
            index++;
            if (index >= length) index = 0;
            if (index === this._active) return index;
            if (! list[index].indicator.hasClass('ui-state-disabled')) found = index;
        } while (found === null);

        return found;
    },

    prev: function() {
        var index = this._active,
            found = null,
            list = this._imageList,
            length = list.length;

        do {
            index--;
            if (index < 0) index = length-1;
            if (index === this._active) return index;
            if (! list[index].indicator.hasClass('ui-state-disabled')) found = index;
        } while (found === null);

        return found;
    },

    start: function() {
        if (this._start()) {
            this.playPause
            .attr('title', 'Pause')
            .find('span')
                .removeClass('ui-icon-play').addClass('ui-icon-pause');
        }
        return this;
    },

    stop: function() {
        if (this._stop()) {
            this.playPause
            .attr('title', 'Play')
            .find('span')
                .removeClass('ui-icon-pause').addClass('ui-icon-play');
        }
        return this;
    },

    _forward: function() { this._activate(this.next()) },
    _reverse: function() { this._activate(this.next()) },

    _startStop: function() {
        this._running ? this.stop() : this.start();
        return this;
    },

    _start: function() {
        if (!this._running) {
            var self = this,
                func = null;

            switch (this.direction) {
                case 'forward':
                    func = function() { self._activate(self.next()) };
                    this._bounceDir = 'next';
                    break;
                case 'reverse':
                    func = function() { self._activate(self.prev()) };
                    this._bounceDir = 'prev';
                    break;
                case 'bounce':
                    if (!this._bounceDir) this._bounceDir = 'next';
                    func = function() {
                        var index;
                        if (self._bounceDir === 'next') {
                            index = self.next();
                            if (index < self._active) {
                                index = self.prev();
                                self._bounceDir = 'prev';
                            }
                        } else {
                            index = self.prev();
                            if (index > self._active) {
                                index = self.next();
                                self._bounceDir = 'next';
                            }
                        }
                        self._activate(index);
                    };
                    break;
            }

            this._running = setInterval(func, this.delay);
            return true;
        }
        return false;
    },

    _stop: function() {
        if (this._running) {
            clearInterval(this._running);
            this._running = 0;
            return true;
        }
        return false;
    },

    _direction: function( dir ) {
        this.direction = dir;
        if (this._running) {
            this._stop();
            this._start();
        }
        return this;
    }


});

jq.extend(jq.ui.flipbook, {
  version: '0.0.0',
  defaults: {
    images: []
  }
});

})(jQuery);

