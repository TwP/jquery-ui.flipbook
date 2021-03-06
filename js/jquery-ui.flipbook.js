
(function(jq) {

jq.widget('ui.flipbook', {
    version: '1.2.0',
    options: {
        images: [],
        wait: 60,
        keyboard: true,
        animate: true,
        direction: 'forward',
        speed: 32
    },

    _create: function( ) {
        var self = this,
            o = this.options,
            context = this.element[0];

        this.element
        .addClass('ui-fb ui-widget ui-widget-content ui-corner-all ui-helper-clearfix')
        .attr('role','flipbook')
        .append(
            '<div class="ui-fb-controls ui-widget-content ui-corner-left">' +
            '    <div class="ui-fb-buttons ui-helper-clearfix">' +
            '        <a class="ui-fb-button ui-state-default ui-fb-button-icon-solo ui-corner-all" title="Prev"><span class="ui-icon ui-icon-seek-prev"></span>Prev</a>' +
            '        <a class="ui-fb-button ui-state-default ui-fb-button-icon-solo ui-corner-all" title="Play"><span class="ui-icon ui-icon-play"></span>Play or Pause</a>' +
            '        <a class="ui-fb-button ui-state-default ui-fb-button-icon-solo ui-corner-all" title="Next" style="margin-right:0;"><span class="ui-icon ui-icon-seek-next"></span>Next</a>' +
            '    </div>' +
            '    <div class="ui-fb-speed"></div>' +
            '    <div class="ui-fb-loop ui-fb-buttonset ui-fb-buttonset-single">' +
            '        <button name="Forward" class="ui-fb-button ui-state-default ui-priority-primary ui-corner-top">Forward</button>' +
            '        <button name="Reverse" class="ui-fb-button ui-state-default ui-priority-primary">Reverse</button>' +
            '        <button name="Bounce" class="ui-fb-button ui-state-default ui-priority-primary ui-corner-bottom">Bounce</button>' +
            '    </div>' +
            '    <ul class="ui-fb-indicators ui-helper-clearfix"></ul>' +
            '</div>' +
            '<div class="ui-fb-images ui-widget-content ui-corner-right">' +
            '  <div class="ui-fb-loader" style="display:none;"><div class="ui-widget-overlay ui-corner-all"></div>Loading ... <span></span></div>' +
            '</div>'
        );

        var $buttons = jq('.ui-fb-buttons', context),
            width = 3 * $buttons.find('a:first').outerWidth(true) - 6;
        $buttons.width(width);
        jq('.ui-fb-loop', context).width(width);

        this.images = jq('.ui-fb-images', context);
        this.indicators = jq('ul.ui-fb-indicators', context)
        .bind('click', function(e) {
            if (e.target.nodeName !== 'LI') return;
            var $target = jq(e.target);
            if ($target.hasClass('ui-fb-not-loaded')) return;
            $target.toggleClass('ui-state-disabled');
        })
        .bind('mouseover', function(e) {
            if (e.target.nodeName !== 'LI') return;
            var $target = jq(e.target);
            if ($target.hasClass('ui-fb-not-loaded')) return;
            $target.addClass('ui-state-hover');
        })
        .bind('mouseout', function(e) {
            if (e.target.nodeName !== 'LI') return;
            var $target = jq(e.target);
            if ($target.hasClass('ui-fb-not-loaded')) return;
            $target.removeClass('ui-state-hover');
        });

        // slider for animation speed
        jq('.ui-fb-speed', context).slider({
            min: 2,
            max: 40,
            value: o.speed,
            range: 'min',
            change: function(event, ui) { self._delay(ui.value) }
        });
        jq('.ui-slider-range-min', context).addClass('ui-corner-left');

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

        this.playPause = jq('a[title=Play]', context).click(function() { self.startStop() });
        jq('a[title=Prev]', context).click(function() { self.stop().prev() });
        jq('a[title=Next]', context).click(function() { self.stop().next() });

        jq('button[name=Forward]', context).click(function() { self._direction('forward') });
        jq('button[name=Reverse]', context).click(function() { self._direction('reverse') });
        jq('button[name=Bounce]', context).click(function() { self._direction('bounce') });

        var direction = o.direction;
        if (direction !== 'forward' && direction !== 'reverse' && direction !== 'bounce') { direction = 'forward'; }
        this._direction(direction);
        jq('button[name='+direction.charAt(0).toUpperCase() + direction.slice(1)+']', context).mousedown();

        this._delay(jq('.ui-fb-speed', context).slider('value'));
        this._imageList = [];
        this._retry = {
            list: [],
            count: 0,
            id: 0
        };

        if (o.keyboard) { self._keyboardBindings(); }
        this._setOption('images', o.images);
    },

    destroy: function() {
        if (this.options.keyboard) {
            jq(document)
            .unbind(jq.browser.mozilla ? 'keypress' : 'keydown', this._keydown)
            .unbind('keyup', this._keyup);
        }

        this.element
        .removeClass('ui-fb ui-fb-hide-controls ui-widget ui-widget-content ui-corner-all ui-helper-clearfix')
        .removeAttr('role','flipbook')
        .removeData('flipbook')
        .empty();
    },

    _setOption: function( key, value ) {
        jq.Widget.prototype._setOption.apply(this, arguments);

        switch (key) {
        case 'images':
            if (value && value.length > 0) this.stop()._load();
            break;
        }
    },


    // FIXME: make the loader it's own little function / object inside the looper
    //
    // 1 -> the loader will insert images into the image area
    // 2 -> upon insertion, a notification is sent to the display portion of the looper
    // 3 -> the display portion might not exist

    _load: function() {
        var self = this,
            obj = null;

        clearInterval(this._retry.id);
        this._retry.list.length = 0;
        this._retry.count = 0;

        jq('.ui-fb-loader', this.element[0]).show();
        this.images.find('img').remove();
        this._imageList.length = 0;
        this.indicators.empty();
        this._imageLoadCount = 0;

        jq.each(this.options.images, function(ii, val) {
            obj = {
                image:     jq('<img />'),    // just a placeholder for now
                indicator: jq('<li></li>').addClass('ui-corner-all ui-state-default ui-state-disabled ui-fb-not-loaded').text(ii+1)
            };
            self._imageList.push(obj);
            self.images.append(obj.image);
            self.indicators.append(obj.indicator);
            self._addImage(ii, val);
        });

        this.indicators.width( 4 * this.indicators.find('li:first').outerWidth(true) );
        this._retry.id = setInterval(function() {self._retryLoad()}, 1000);
        return this;
    },

    _addImage: function( index, src ) {
        if (this._retry.count) { src += '?_=' + (new Date).getTime() }

        var self = this,
            obj = this._imageList[index],
            oldImg = obj.image,
            newImg = jq('<img />')
                  .attr('src', src)
                  .load(function() {self._imageLoaded(index)})
                  .error(function() {self._retry.list.push(index)});

        obj.image = newImg;
        oldImg.removeAttr('src').replaceWith(newImg);
        return this;
    },

    _imageLoaded: function( index ) {
        this._imageLoadCount++;
        this._imageList[index].indicator.toggleClass('ui-state-disabled').removeClass('ui-fb-not-loaded');

        if (this._imageLoadCount === 1) {
            var $image = this._imageList[index].image;
            this.images.css({width: $image.width(), height: $image.height()});
            this.element.css('min-width', this.images.outerWidth(true) + jq('.ui-fb-controls', this.element[0]).outerWidth(true));
            this._activate(index);
            jq('.ui-fb-loader', this.element[0]).hide();
            if (this.options.animate) { this.start(); }
        }

        return this;
    },

    _retryLoad: function() {
        if ((this._imageLoadCount === this._imageList.length) || (this._retry.count >= this.options.wait)) {
            clearInterval(this._retry.id);
            this._retry.id = 0;
            (this._imageLoadCount === this._imageList.length) ?
                this._trigger('load') : this._trigger('error');
            return this;
        }

        var self = this,
            images = this.options.images,
            img = null;

        this._retry.count++;
        jq.each(this._retry.list, function(ii, index) {self._addImage(index, images[index])});
        this._retry.list.length = 0;
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

    _next: function() {
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

    _prev: function() {
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

    next: function() {
        this._activate(this._next());
        return this;
    },

    prev: function() {
        this._activate(this._prev());
        return this;
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

    startStop: function() {
        this._running ? this.stop() : this.start();
        return this;
    },

    _start: function() {
        if (!this._running) {
            var self = this,
                func = null;

            switch (this.direction) {
            case 'forward':
                func = function() { self.next() };
                this._bounceDir = 'next';
                break;
            case 'reverse':
                func = function() { self.prev() };
                this._bounceDir = 'prev';
                break;
            case 'bounce':
                if (!this._bounceDir) this._bounceDir = 'next';
                func = function() {
                    var index;
                    if (self._bounceDir === 'next') {
                        index = self._next();
                        if (index < self._active) {
                            index = self._prev();
                            self._bounceDir = 'prev';
                        }
                    } else {
                        index = self._prev();
                        if (index > self._active) {
                            index = self._next();
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
    },

    _keyboardBindings: function() {
        var self = this,
            context = this.element[0],
            $handle = jq('.ui-fb-speed .ui-slider-handle', context);

        this._keydown = function( event ) {
            if (event.altKey || event.ctrlKey || event.metaKey) { return; }
            var code = event.keyCode ? event.keyCode : event.which;

            switch (code) {
            case jq.ui.keyCode.SPACE:      // spacebar
                self.startStop();
                return false;    // prevent default browser behavior

            case jq.ui.keyCode.LEFT:       // left arrow
                self.stop().prev();
                return false;

            case jq.ui.keyCode.RIGHT:      // right arrow
                self.stop().next();
                return false;

            case jq.ui.keyCode.UP:         // up arrow
            case jq.ui.keyCode.DOWN:       // down arrow
                if (event.target === $handle[0]) { break; }

                event.target = $handle[0];
                $handle.trigger(event);
                return false;

            case 66:   // 'b'
                jq('button[name=Bounce]', context).mousedown();
                self._direction('bounce');
                return false;

            case 70:  // 'f'
                jq('button[name=Forward]', context).mousedown();
                self._direction('forward');
                return false;

            case 82:  // 'r'
                jq('button[name=Reverse]', context).mousedown();
                self._direction('reverse');
                return false;
            }
        };

        this._keyup = function( event ) {
            var code = event.keyCode ? event.keyCode : event.which;

            switch (code) {
            case jq.ui.keyCode.UP:         // up arrow
            case jq.ui.keyCode.DOWN:       // down arrow
                if (event.target === $handle[0]) { break; }

                event.target = $handle[0];
                $handle.trigger(event);
                return false;
            }
        };

        jq(document)
        .bind(jq.browser.mozilla ? 'keypress' : 'keydown', this._keydown)
        .bind('keyup', this._keyup);
    }
});

})(jQuery);

