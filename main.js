$(document).ready(function () {

    $.fn.makeDraggable = function(options) {
        var $rootElement = this;
        var $currentItem = null;
        var $draggableStub = $('<li>').toggleClass('draggable-item', true).toggleClass('draggable-stub', true);
        var $container = $('#container');
        var parentId = "";
        var movingInfo = { "data": [] };
        var timerId = null;
        var lastEvent = null;
        var elementOffset = { x: 0, y: 0 };
        var mousedown = false;

        this.find('.draggable-list > li').each(function(index, item) {
            var $item = $(item);
            $item.toggleClass('draggable-item', true);
            $item.mousedown(_makeDraggable);
        });

				
        this.mousemove(function(event) {
            lastEvent = event;
            if ($currentItem && mousedown) {
                var listCount = $currentItem.parent().children().length

                if ($currentItem.hasClass('draggable-item-selected')) {
                    $currentItem = $container;

                    $currentItem.append($('.draggable-item-selected'));
                }
                $currentItem.toggleClass('dragging', true);

                if (!$currentItem.hasClass('container')) {
                    $draggableStub.insertAfter($currentItem.children().last());
                }
                $currentItem.toggleClass('dragging', true);
                _setRelativePosition(event);
                var $elem = _getCurrentTarget(event);
                if ($elem) {
                    if ($elem.hasClass('draggable-list')) {
                        $elem.append($draggableStub);
                    } else {
                        var childPos = $currentItem.offset();
                        var parentPos = $draggableStub.parent().offset();

                        if ($elem.length > 0 && mousedown) {
                            clearTimeout(timerId);
                            var $savedItem = $currentItem;
                            timerId = setTimeout(function() {
                                var $hoverElement = _getCurrentTarget(lastEvent);
                                if (mousedown && $elem.is($hoverElement)) {
                                    $elem.trigger('MergeItems', [$elem, $savedItem, event.pageY]);
                                }
                            }, 2000);
                            if (!$elem.hasClass('draggable-stub-empty')) {
                                if (childPos && parentPos && childPos.top - parentPos.top < $($currentItem.children[0]).outerHeight() / 2) {
                                    $draggableStub.insertBefore($elem);
                                } else {
                                    $draggableStub.insertAfter($elem);
                                }
                            }
                        }
                    }
                }
            }
        });

        $(document).mouseup(function() {
            mousedown = false;
            clearTimeout(timerId);
            if ($currentItem) {
                var $element = _getCurrentTarget(event);
                if ($element.length == 0) {
                    if ($currentItem.hasClass('container')) {
                        $('#' + parentId).append($currentItem.children())
                        $currentItem = null;
                    } else {
                        $currentItem.removeAttr('style');
                        $currentItem.toggleClass('dragging', false);
                    }
                } else {

                    if ($element.hasClass('draggable-stub-empty')) {
                        $element.replaceWith($draggableStub);
                    }

                    if ($currentItem.children().length > 0) {
                        var $items = "Items "
                        for (i = 0; i < $currentItem.children().length; i++) {
                            $items += $($currentItem.children()[i]).html() + " ";
                        }
                        $currentItem.trigger('OnDropped', [movingInfo, $draggableStub.parent().attr("name")]);
                        movingInfo.data.length = 0;
                        $currentItem.removeAttr('style');
                        $currentItem.children().insertAfter($draggableStub);
                        $currentItem.toggleClass('dragging', false);
                        $('.draggable-item-selected').toggleClass('draggable-item-selected', false)
                        $currentItem = null;
                    } else if (!$currentItem.hasClass('draggable-item-selected') && $currentItem.hasClass('dragging')) {
                        $currentItem.trigger('OnDropped', [movingInfo, $draggableStub.parent().attr("name")]);
                        movingInfo.data.length = 0;
                        $currentItem.insertAfter($draggableStub);
                        $currentItem.toggleClass('dragging', false);
                        $currentItem = null;
                    }
                }
            }
            $draggableStub.detach();
        });
		
		$('.draggable').on('add', function(e, $button, data) {
			var $newItem = $('<li>').toggleClass('draggable-item', true).text(data);
			$newItem.mousedown(_makeDraggable);
			$newItem.insertBefore($button);
		});
		
		$('.draggable').on('sort', function(e, $button) {
			var $list = $button.parent();
			var sorted = $list.find("> .draggable-item").sort(function(a, b) {
				return $(a).text().toLowerCase() > $(b).text().toLowerCase() ? 1 : -1;
			});
			$list.prepend(sorted);
		});
		
		function _makeDraggable(event) {
			mousedown = true;
                $currentItem = $(this);
                var pos = $currentItem.offset();
                elementOffset.x = event.pageX - pos.left;
                elementOffset.y = event.pageY - pos.top;

                if (!$currentItem.hasClass('draggable-item-selected') && !event.shiftKey) {
                    movingInfo.data.push({ "name": $currentItem.parent().attr('name'), "item": $currentItem.html() });
                }

                if (event.ctrlKey) {
                    if ($currentItem.hasClass('draggable-item-selected')) {
                        $currentItem.toggleClass('draggable-item-selected', false);
                        for (i = 0; i < movingInfo.data.length; i++) {
                            if (movingInfo.data[i].name == $currentItem.parent().attr('name') && movingInfo.data[i].item == $currentItem.html()) {
                                movingInfo.data.splice(i, 1);
                            }
                        }
                    } else {
                        $currentItem.toggleClass('draggable-item-selected', true);
                    }
                } else if (event.shiftKey) {
                    var indexFirst = -1;
                    var indexLast = -1;
                    if ($('.draggable-item-selected').index() < $currentItem.index()) {
                        indexFirst = $('.draggable-item-selected').index();
                        indexLast = $currentItem.index();
                    } else {
                        indexFirst = $currentItem.index();
                        indexLast = $('.draggable-item-selected').index();
                    }

                    var currentChildren = $currentItem.parent().children();

                    for (i = indexFirst; i <= indexLast; i++) {
                        var $currentChild = $(currentChildren[i]);
                        if (!$currentChild.hasClass('draggable-item-selected')) {
                            $currentChild.toggleClass('draggable-item-selected', true);
                            movingInfo.data.push({ "name": $currentChild.parent().attr('name'), "item": $currentChild.html() });
                        }
                    }
                } else {
                    if (!$currentItem.parent().children().hasClass('draggable-item-selected') && $('.draggable-item-selected').length > 0) {
                        $('.draggable-item-selected').toggleClass('draggable-item-selected', false);
                    } else if ($currentItem.parent().children().hasClass('draggable-item-selected') && $('.draggable-item-selected').length > 0 && !$currentItem.hasClass('draggable-item-selected')) {
                        $('.draggable-item-selected').toggleClass('draggable-item-selected', false);
                    } else if ($currentItem.hasClass('draggable-item-selected') && $('.draggable-item-selected').length < 2) {
                        $('.draggable-item-selected').toggleClass('draggable-item-selected', false);
                    } else if ($('.draggable-item-selected').length == 1) {
                        $('.draggable-item-selected').toggleClass('draggable-item-selected', false);
                    }
                    $currentItem.toggleClass('draggable-item-selected', true);
                }
                parentId = $currentItem.parent().attr('id');
		};

		
        function _setRelativePosition(event) {
            var parentOffet = $rootElement.offset();
            var relX = event.pageX - elementOffset.x - parentOffet.left;
            var relY = event.pageY - elementOffset.y - parentOffet.top
            $currentItem.css({
                'top': relY + 'px',
                'left': relX + 'px'
            });
        }

        function _getCurrentTarget(event) {
            if (navigator.userAgent.match('MSIE') || navigator.userAgent.match('Gecko')) {
                var x = event.clientX, y = event.clientY;
            } else {
                var x = event.pageX, y = event.pageY;
            }
            $currentItem.hide();
            var $elem = $(document.elementFromPoint(x, y));
            $currentItem.show();
            if ($elem.hasClass('draggable-stub-empty')) {
                return $elem;
            }
            if ($elem.closest('.draggable-list').find('li').length === 0) {
                return $elem.closest('.draggable-list');
            }
            return $elem.closest('.draggable-item:not(.dragging.draggable-stub)');
        }

        $('.draggable').on('MergeItems', function(e, mergeTo, mergeElem, pageY) {
            mergeToPos = mergeTo.offset();
            if ((!mergeTo.hasClass('draggable-stub')) && (mergeToPos.top + 0.15 * $('.draggable-item').height() < pageY) && (mergeToPos.top + 0.85 * $('.draggable-item').height() > pageY)) {
                if (mergeElem && mergeTo) {
                    if ($currentItem.hasClass('container') && $('.draggable-item-selected').length > 0) {
                        for (i = 0; i < $currentItem.children().length; i++)
                            mergeTo.text(mergeTo.html() + ' ' + $($currentItem.children()[i]).html());
                        $currentItem.removeAttr('style');
                        mergeTo.trigger('OnCombined', [mergeTo.text()]);
                        $currentItem.children().detach();
                        $currentItem.toggleClass('dragging', false);
                        $('.draggable-item-selected').toggleClass('draggable-item-selected', false)
                    } else {
                        mergeTo.text(mergeTo.html() + ' ' + mergeElem.html());
                        $currentItem.detach();
                    }
                    $currentItem = null;
                }
            }
        })
    };

    $('.draggable').makeDraggable();
    $('.draggable').on('OnDropped', function (e, info, to) {
        for (i = 0; i < info.data.length; i++) {
            console.log("Track " + info.data[i].item + " was moved from playlist with name: " + info.data[i].name + ", to playlist with name: " + to);
        }
    });
    $('.draggable').on('OnCombined', function (e, combinedText) {
        console.log(combinedText);
    });
	
	$('.draggable-btn.add').click(function() {
		$('.draggable').trigger('add', [$(this), 'Some text']);
	});
	
	$('.draggable-btn.sort').click(function() {
		$('.draggable').trigger('sort', [$(this)]);
	});
});