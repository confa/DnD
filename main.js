$(document).ready(function() {

	$.fn.makeDraggable = function(options) {
		var $rootElement = this;
		var $currentItem = null;
		var $draggableStub = $('<li>').toggleClass('draggable-item', true).toggleClass('draggable-stub', true);
		var $lastElement = $('<li>').toggleClass('draggable-item-shaper', true);
		var timerId = null;
		
		this.find('.draggable-list > li').each(function (index, item) {
			var $item = $(item);
			$item.toggleClass('draggable-item', true);
			$item.mousedown(function (event) {
				$currentItem = $(this);
				if(event.ctrlKey) {
					$currentItem.toggleClass('draggable-item-selected', true);
				}
				else if(event.shiftKey) {
					var $lastSelectedItem = $currentItem.parent().children(".draggable-item-selected").last();
					var allItems = $currentItem.parent().children();
					var flag = false;
					for(var i = 0; i < allItems.length; i++) {
						if(allItems[i] === $lastSelectedItem[0]) {
							flag = true;
						}
						if(allItems[i] == $currentItem.context) {
							break;
						}
						if(flag == true) {
							var $item = $(allItems[i]);
							$item.toggleClass('draggable-item-selected', true);
						}
					}
					$currentItem.toggleClass('draggable-item-selected', true);
				}
				else {
					$currentItem.toggleClass('dragging', true);
					$draggableStub.insertAfter($currentItem);
				}
				if($currentItem.parent().children().length == 1) {
					$lastElement.insertAfter($currentItem);
				}
				
				_setRelativePosition(event);
			});
			
		});

		this.mousemove(function (event) {
			if($currentItem) {
				var s = $currentItem.parent().children('.draggable-item-selected');
				if(s.length > 0)
				for(var i = 0; i < s.length; i++) {
					$currentItem = s;
					_setRelativePosition(event);
				}
				_setRelativePosition(event);
				var $elem = _getCurrentTarget(event);
				if($elem) {
					var childPos = $currentItem.offset();
					var parentPos = $draggableStub.parent().offset();
					clearTimeout(timerId);
					if(!$elem.hasClass('draggable-stub')) {
						timerId = setTimeout(function() {
							if($currentItem && $elem) {
								$elem.text($elem.text() + ' ' + $currentItem.text());
								$currentItem.detach();
								$currentItem = null;
								$elem.trigger('OnСombined', [$currentItem.text()]);
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
		});

		$(document).mouseup(function(event) {
			if($currentItem) {
				if(event.ctrlKey || event.shiftKey) {
					$currentItem.removeAttr('style');
					$currentItem = null;
				}
				else {
					if($draggableStub.parent().children().length == 2) {
						$lastElement.detach();
					}
					var selectedItems = $currentItem.parent().children('.draggable-item-selected').toggleClass('draggable-item-selected', false);;
					
					$currentItem.trigger('OnDropped', [$currentItem.parent().attr('name'), $draggableStub.parent().attr('name'), $currentItem.text()]);
					$currentItem.removeAttr('style');
					$currentItem.detach();
					$currentItem.insertAfter($draggableStub);
					$currentItem.toggleClass('dragging', false);
					$currentItem = null;
				}
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
			return $elem.closest('.draggable-item-shaper,.draggable-item:not(.dragging.draggable-stub)');
		}
	};

	$('.draggable').makeDraggable();
	$('.draggable').on('OnDropped', function(e, from, to, name) {
		console.log('Element ' + name + ' has been dragged from ' + from + ' to ' + to);
	});
});