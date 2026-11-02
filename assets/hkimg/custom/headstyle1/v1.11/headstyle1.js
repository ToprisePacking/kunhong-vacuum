(function(){
	const toggleButton = document.querySelector('.headerstyle1 .menu-toggle');
	const drawer = document.querySelector('.headerstyle1  .side-drawer');
	const overlay = document.querySelector('.headerstyle1  [data-overlay]');
	const closeBtn = document.querySelector('.headerstyle1  .drawer-close');
	const searchToggle = document.querySelector('.headerstyle1  .search-toggle');
	const searchPopover = document.querySelector('.headerstyle1  .search-popover');
	//const headerDom = document.querySelector('.SITE_HEADER');
	const drawerNav = document.querySelector('.headerstyle1  .drawer-nav');
	const primaryNav = document.querySelector('.headerstyle1  .primary-nav');

	// Header scrolled state
	// function onScroll() {
	// 	if (!header) return;
	// 	const scrolled = window.scrollY > 4;
	// 	header.classList.toggle('scrolledHead', scrolled);
	// }
	// window.addEventListener('scroll', onScroll, { passive: true });
	// onScroll();

	function openDrawer() {
		if (!drawer || !overlay) return;
			drawer.hidden = false;
			drawer.setAttribute('aria-hidden', 'false');
			overlay.hidden = false;
			overlay.classList.add('active');
			toggleButton?.setAttribute('aria-expanded', 'true');
			requestAnimationFrame(() => {
				drawer.classList.add('open');
				drawer.focus();
			});
	}

	function closeDrawer() {
		if (!drawer || !overlay) return;
		drawer.classList.remove('open');
		drawer.setAttribute('aria-hidden', 'true');
		overlay.classList.remove('active');
		// wait for fade-out before hiding to avoid click-through
		setTimeout(() => { overlay.hidden = true; }, 250);
		toggleButton?.setAttribute('aria-expanded', 'false');
	}

	// Toggle open
	toggleButton?.addEventListener('click', openDrawer);
	// Close actions
	closeBtn?.addEventListener('click', closeDrawer);
	overlay?.addEventListener('click', closeDrawer);

	// ESC to close
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			closeDrawer();
			closeSearchPopover();
		}
	});

	function openSearchPopover() {
		if (!searchPopover) return;
		searchPopover.hidden = false;
		searchPopover.classList.add('show');
		searchToggle?.setAttribute('aria-expanded', 'true');
		// Focus input after animation starts
		setTimeout(() => {
			const input = searchPopover.querySelector('input');
			input?.focus();
		}, 50);
	}

	function closeSearchPopover() {
		if (!searchPopover) return;
		searchPopover.classList.remove('show');
		searchToggle?.setAttribute('aria-expanded', 'false');
		// Wait for CSS transition to finish before hiding to avoid jump
		setTimeout(() => { searchPopover.hidden = true; }, 300);
	}

	searchToggle?.addEventListener('click', () => {
		const expanded = searchToggle.getAttribute('aria-expanded') === 'true';
		if (expanded) closeSearchPopover(); else openSearchPopover();
	});

	document.addEventListener('click', (e) => {
		if (!searchPopover || !searchPopover.classList.contains('show')) return;
		if (!searchPopover.contains(e.target) && !searchToggle?.contains(e.target)) {
			closeSearchPopover();
		}
	});

	// Drawer nested expand/collapse via event delegation
	drawerNav?.addEventListener('click', (e) => {
		const btn = e.target.closest('.expand-toggle');
		if (!btn) return;
		const li = btn.closest('li');
		const submenu = li?.querySelector(':scope > .submenu');
		if (!submenu) return;
		const expanded = btn.getAttribute('aria-expanded') === 'true';
		btn.setAttribute('aria-expanded', String(!expanded));
		submenu.classList.toggle('open', !expanded);
	});

	// Primary nav: JS-controlled hover open/close with animation
	let hoverTimeout = null;

	// 工具函数：兼容无 closest 的环境，并稳健处理事件 target
	function asElement(node) {
		if (!node) return null;
		// 元素节点
		if (node.nodeType === 1) return node;
		// 文本/注释等，取父元素
		return node.parentElement || null;
	}
	function closestEl(el, selector, stopAt = null) {
		for (let cur = el; cur && cur !== stopAt; cur = cur.parentElement) {
			const m = cur.matches || cur.msMatchesSelector || cur.webkitMatchesSelector;
			if (m && m.call(cur, selector)) return cur;
		}
		return null;
	}
	function getEventTarget(e) {
		return asElement(e.target);
	}
	function getRelatedTarget(e) {
		return asElement(e.relatedTarget);
	}

	function closeAllPrimary() {
		primaryNav?.querySelectorAll('.has-sub.open').forEach((openLi) => {
			closeSubmenu(openLi);
		});
	}

	function openSubmenu(li) {
		// Close siblings at same level
		const parentUl = li.parentElement;
		parentUl?.querySelectorAll(':scope > .has-sub.open').forEach(sib => {
			if (sib !== li) {
				// 使用统一的关闭逻辑，确保mega-dropdown也隐藏
				closeSubmenu(sib);
			}
		});
		// Open current
		li.classList.add('open');
		const a = li.querySelector(':scope > a');
		a?.setAttribute('aria-expanded', 'true');
		
		// 特殊处理全屏宽度下拉菜单
		if (li.classList.contains('mega-menu')) {
			const megaDropdown = li.querySelector('.mega-dropdown');
			if (megaDropdown) {
				// 动态计算全屏位置和宽度
				const viewportWidth = window.innerWidth;
				const liRect = li.getBoundingClientRect();
				
				// 设置全屏宽度和位置
				megaDropdown.style.width = viewportWidth + 'px';
				megaDropdown.style.left = -liRect.left + 'px';
				
				// 确保下拉菜单显示并触发动画
				megaDropdown.style.display = 'block';
				// 使用 requestAnimationFrame 确保动画正确触发
				requestAnimationFrame(() => {
					megaDropdown.style.opacity = '1';
					megaDropdown.style.maxHeight = '1000px';
				});
			}
		}
	}

	function closeSubmenu(li) {
		li.classList.remove('open');
		const a = li.querySelector(':scope > a');
		a?.setAttribute('aria-expanded', 'false');
		// Close all children
		closeAllChildren(li);
		
		// 特殊处理全屏宽度下拉菜单
		if (li.classList.contains('mega-menu')) {
			const megaDropdown = li.querySelector('.mega-dropdown');
			if (megaDropdown) {
				megaDropdown.style.opacity = '0';
				megaDropdown.style.maxHeight = '0';
				// 动画结束后隐藏元素
				setTimeout(() => {
					if (!li.classList.contains('open')) {
						megaDropdown.style.display = 'none';
					}
				}, 350);
			}
		}
	}

	function closeAllChildren(parentLi) {
		parentLi?.querySelectorAll('.has-sub.open').forEach(childLi => {
			closeSubmenu(childLi);
		});
	}

	// Mouse events for primary navigation
	primaryNav?.addEventListener('mouseenter', (e) => {
		clearTimeout(hoverTimeout);
		
		const targetEl = getEventTarget(e);
		const li = closestEl(targetEl, '.has-sub', primaryNav);
		if (li && primaryNav.contains(li)) {
			openSubmenu(li);
		}
	}, true);

	primaryNav?.addEventListener('mouseleave', (e) => {
		const rt = getRelatedTarget(e);
		// 如果鼠标移动到mega-dropdown，不关闭菜单
		if (rt && closestEl(rt, '.mega-dropdown', document)) {
			return;
		}
		// 如果鼠标还在primary-nav内，不关闭菜单
		if (rt && primaryNav.contains(rt)) {
			return;
		}
		hoverTimeout = setTimeout(() => {
			closeAllPrimary();
		}, 150);
	});

	// 处理所有submenu的鼠标事件（二级、三级等）
	primaryNav?.addEventListener('mouseenter', (e) => {
		const submenu = e.target.closest('.submenu');
		if (submenu) {
			clearTimeout(hoverTimeout);
		}
	}, true);

	primaryNav?.addEventListener('mouseleave', (e) => {
		const targetEl = getEventTarget(e);
		const submenu = closestEl(targetEl, '.submenu', primaryNav);
		if (submenu) {
			const rt = getRelatedTarget(e);
			const parentLi = closestEl(submenu, '.has-sub', primaryNav);
			// 如果鼠标移回到父级li或其他submenu，不关闭
			if (rt && (parentLi?.contains(rt) || closestEl(rt, '.submenu', primaryNav) || primaryNav.contains(rt))) {
				return;
			}
			// 否则关闭当前submenu
			hoverTimeout = setTimeout(() => {
				if (parentLi) {
					closeSubmenu(parentLi);
				}
			}, 150);
		}
	}, true);

	// 处理mega-dropdown的鼠标事件
	document.addEventListener('mouseenter', (e) => {
		const targetEl = getEventTarget(e);
		const megaDropdown = closestEl(targetEl, '.mega-dropdown', document);
		if (megaDropdown) {
			clearTimeout(hoverTimeout);
		}
	}, true);

	document.addEventListener('mouseleave', (e) => {
		const targetEl = getEventTarget(e);
		const megaDropdown = closestEl(targetEl, '.mega-dropdown', document);
		if (megaDropdown) {
			const rt = getRelatedTarget(e);
			// 如果鼠标移回到primary-nav，不关闭菜单
			if (rt && primaryNav?.contains(rt)) {
				return;
			}
			// 如果鼠标移到其他mega-dropdown，不关闭菜单
			if (rt && closestEl(rt, '.mega-dropdown', document)) {
				return;
			}
			// 否则关闭菜单
			hoverTimeout = setTimeout(() => {
				closeAllPrimary();
			}, 150);
		}
	}, true);

	// 额外规则：在任意层级移入叶子项（无子级）时，关闭同层的其它已打开子级
	primaryNav?.addEventListener('mouseenter', (e) => {
		const targetEl = getEventTarget(e);
		const leafLi = closestEl(targetEl, 'li:not(.has-sub)', primaryNav);
		if (leafLi) {
			const parentUl = leafLi.parentElement;
			if (parentUl) {
				Array.from(parentUl.children).forEach((child) => {
					if (child.classList && child.classList.contains('has-sub') && child.classList.contains('open')) {
						closeSubmenu(child);
					}
				});
			}
		}
	}, true);

	// Keyboard a11y: Enter/Space to toggle, Esc to close
	primaryNav?.addEventListener('keydown', (e) => {
		const link = e.target.closest('.has-sub > a');
		if (!link) return;
		
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			const li = link.parentElement;
			const isOpen = li.classList.contains('open');
			if (isOpen) {
				closeSubmenu(li);
			} else {
				openSubmenu(li);
			}
		}
		
		if (e.key === 'Escape') {
			const li = link.parentElement;
			closeSubmenu(li);
		}
	});

})();

(function(){
      const btn = document.querySelector('.headerstyle1  .lang-btn');
      const list = document.querySelector('.headerstyle1  .lang-list');
      if (!btn || !list) return;
      
      function openLangList() {
        list.hidden = false;
        list.classList.add('show');
        btn.setAttribute('aria-expanded', 'true');
      }
      
      function closeLangList() {
        list.classList.remove('show');
        btn.setAttribute('aria-expanded', 'false');
        setTimeout(() => { list.hidden = true; }, 300);
      }
      
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        if (expanded) {
          closeLangList();
        } else {
          openLangList();
        }
      });
      
      list.addEventListener('click', (e) => {
        const item = e.target.closest('[role="option"]');
        if (!item) return;
        let langtext=btn.querySelector('.lang-pc-btn-text');
        langtext.innerHTML = item.textContent;
        list.querySelectorAll('[role="option"]').forEach(o => o.setAttribute('aria-selected','false'));
        item.setAttribute('aria-selected','true');
        closeLangList();
      });
      
      document.addEventListener('click', (e) => {
        if (!list.classList.contains('show')) return;
        if (!btn.contains(e.target) && !list.contains(e.target)) {
          closeLangList();
        }
      });
    })();
