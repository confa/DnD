$(document).ready(function() {

	$.fn.makeDraggable = function(options) {
		var $rootElement = this;
		var $currentItem = null;
		var $draggableStub = $('<li>').toggleClass('draggable-item', true).toggleClass('draggable-stub', true);
		var timer = null;

		this.find('.draggable-list > li').each(function (index, item) {
			var $item = $(item);
			$item.toggleClass('draggable-item', true);
			$item.mousedown(function (event) {
				$currentItem = $(this);
				$draggableStub.insertAfter($currentItem);
				$currentItem.toggleClass('dragging', true);
				_setRelativePosition(event);
			});
		});

		this.mousemove(function (event) {
			if($currentItem) {
				_setRelativePosition(event);
				var $elem = _getCurrentTarget(event);
				if($elem) {
					if ($elem.hasClass('draggable-list'))
					{
						$elem.append($draggableStub);
					}
					else
					{
						var childPos = $currentItem.offset();
						var parentPos = $draggableStub.parent().offset();
						
						var elemPos = $elem.offset();
						clearTimeout(timer);
						if((!$elem.hasClass('draggable-stub')) && (elemPos.top + 0.15*$currentItem.height() < childPos.top) && (elemPos.top + 0.85*$currentItem.height() > childPos.top)) {
							timer = setTimeout(function() {
								if($currentItem && $elem) {
									$('.draggable').append('<ul class="draggable-list new-list"></ul>');
									$currentItem.removeClass('dragging');
									$('.new-list').append($elem);
									$('.new-list').append($currentItem);
									$currentItem = null;
									$draggableStub.detach();
									$('ul:last').removeClass('new-list');
								}
							}, 2000);
						}
						
						if(childPos && parentPos && childPos.top - parentPos.top < $currentItem.outerHeight() / 2) {
							$draggableStub.insertBefore($elem);
						} else {
							$draggableStub.insertAfter($elem);
						}
					}
				}
			}
		});

		$(document).mouseup(function() {
			if($currentItem) {
				$currentItem.trigger('OnDropped', [$currentItem.parent().index(), $draggableStub.parent().index(), $currentItem.text()]);
			
				$currentItem.removeAttr('style');
				$currentItem.detach();
				$currentItem.insertAfter($draggableStub);
				$currentItem.toggleClass('dragging', false);
				
				$currentItem = null;
			}
			$draggableStub.detach();
		});

		function _setRelativePosition(event) {
			var parentOffset = $rootElement.offset();
			var relX = event.pageX - parentOffset.left;
			var relY = event.pageY - parentOffset.top;
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
			var $elem = $(document.elementFromPoint(x,y));
			$currentItem.show();
			if ($elem.closest('.draggable-list').find('li').length === 0)
			{
				return $elem.closest('.draggable-list');
			}
			return $elem.closest('.draggable-item:not(.dragging.draggable-stub)');
		}
	};

	$('.draggable').makeDraggable();
	
	$('.draggable').on('OnDropped', function(e, fromList, toList, name) {
		console.log('Drug item from ' + fromList + ' list to ' + toList + ' list. NAME = ' + name);
	});
});