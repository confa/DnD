$(document).ready(function() {

	$.fn.makeDraggable = function(options) {
		var $mousedown = false;
		var $rootElement = this;
		var $currentItem = null;
		var $draggableStub = $('<li>').toggleClass('draggable-item', true).toggleClass('draggable-stub', true);
		var $draggableStubEmpty = $('<li>').toggleClass('draggable-item', true).toggleClass('draggable-stub-empty', true); 
		var $container = $('#container');
		var $parentId = "";
		var $movingInfo = {"data" : []};
		//var $movingInfo = {};

		this.find('.draggable-list > li').each(function (index, item) {
			var $item = $(item);
			$item.toggleClass('draggable-item', true);
			$item.mousedown(function (event) {
				$mousedown = true;
				$currentItem = $(this);

				if(event.ctrlKey){
					$currentItem.toggleClass('selected', true);
					var $some = {}; 
					//$some[$currentItem.parent().attr('name')] = $currentItem.html(); 
					$some = {"name" : $currentItem.parent().attr('name'), "item" : $currentItem.html()};
					$movingInfo.data.push($some);
					//$movingInfo.push($some)
;					//$movingInfo.push({name : $currentItem.html()});
				}
				else if(event.shiftKey)
				{
					////////// SHIFT ACTION
				}
				$parentId = $currentItem.parent().attr('id');
			});
		});

			this.mousemove(function (event) {

				if ($currentItem && $mousedown) {
					var listCount = $currentItem.parent().children().length

					if ($currentItem.hasClass('selected')) {
						$currentItem = $container;

					$currentItem.append($('.selected'));
					};
					$currentItem.toggleClass('dragging', true);
					$currentItem.toggleClass('dragging-item', true);
					$currentItem.show();

					if (!$currentItem.hasClass	('container')) {
						$draggableStub.insertAfter($currentItem.children().last());
					};
					$currentItem.toggleClass('dragging', true);

					_setRelativePosition(event);
				var $elem = _getCurrentTarget(event);
				if($elem) {
					var childPos = $currentItem.offset();
					var parentPos = $draggableStub.parent().offset();
					if (!$elem.hasClass('draggable-stub-empty')) {
						if(childPos && parentPos && childPos.top - parentPos.top < $currentItem.outerHeight() / 2) {
							$draggableStub.insertBefore($elem);
						} else {
							$draggableStub.insertAfter($elem);
						}
					}
				}
				};
		});

		$(document).mouseup(function() {
			$mousedown = false;
			if($currentItem) {

				var $element = _getCurrentTarget(event);

				if ($element.length == 0) {
					if($currentItem.hasClass('container')){
						$('#' +$parentId).append($currentItem.children())
						$currentItem= null;

					}
					else{
						$currentItem.removeAttr('style');
						$currentItem.toggleClass('dragging', false);
					}
				}
				else{

				if ($element.hasClass('draggable-stub-empty')) {
					$element.replaceWith($draggableStub);
				};

				if ($currentItem.children().length > 0) {
					var $items = "Items "
					for (i = 0; i < $currentItem.children().length; i++) {
						$items += $($currentItem.children()[i]).html() + " ";
					}
					$currentItem.trigger('MoveItem', [$items, $('#' + $parentId).attr('name'), $draggableStub.parent().attr("name")]);

				$currentItem.removeAttr('style');

				$currentItem.children().insertAfter($draggableStub);
				$currentItem.toggleClass('dragging', false);
				$('.selected').toggleClass('selected', false)
				$currentItem = null;
			}
			else if(!$currentItem.hasClass('selected') && $currentItem.hasClass('dragging')) {
				$currentItem.trigger('MoveItem', [$currentItem.html(), $currentItem.parent().attr('name'), $draggableStub.parent().attr("name")]);
				$currentItem.insertAfter($draggableStub);
				$currentItem.toggleClass('dragging', false);
				$currentItem = null;
			}
		};
	};
			if ($('#' + $parentId).children().length < 1) {
				$('#' + $parentId).append($draggableStubEmpty);
			};
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
			if ($elem.hasClass('draggable-stub-empty')) {
				return $elem;
			};
			return $elem.closest('.draggable-item:not(.dragging.draggable-stub)');
		}
	};

	$('.draggable').makeDraggable();
	$('.draggable').on('MoveItem', function (e, name, from, to){
		console.log("Track " + name + " was moved from playlist with name: " + from + ", to playlist with name: " + to);
	});
});