// =========================================
// Gemini Extension: Navigation + NSFW Toggle (V16 Strict Menu)
// =========================================

(function() {
    console.log("Gemini Extension: Loaded");

    // =====================================
    // Part 1: NSFW 開關邏輯
    // =====================================
    
    const STORAGE_KEY = 'gemini_nsfw_enabled';
    let isNsfwEnabled = localStorage.getItem(STORAGE_KEY) !== 'false'; // 預設為 true

    function applyNsfwState() {
        if (isNsfwEnabled) {
            document.body.classList.remove('nsfw-disabled');
        } else {
            document.body.classList.add('nsfw-disabled');
        }
    }
    applyNsfwState();

    function createSwitchItem() {
        const btn = document.createElement('button');
        btn.className = 'gemini-nsfw-switch-item mat-mdc-menu-item'; 
        btn.setAttribute('role', 'menuitem');
        
        const iconSvg = isNsfwEnabled 
            ? `<svg class="gemini-nsfw-status-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>` 
            : `<svg class="gemini-nsfw-status-icon off" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>`; 

        btn.innerHTML = `
            <div class="gemini-nsfw-switch-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="opacity:0.7">
                   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
                </svg>
                <span>NSFW</span>
            </div>
            ${iconSvg}
        `;

        btn.onclick = (e) => {
            e.stopPropagation(); 
            isNsfwEnabled = !isNsfwEnabled;
            localStorage.setItem(STORAGE_KEY, isNsfwEnabled);
            applyNsfwState();
            
            const newBtn = createSwitchItem();
            btn.replaceWith(newBtn);
        };

        return btn;
    }

    // ★★★ V16 修正：精準辨識主選單 ★★★
    const menuObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                // 檢查是否為選單容器
                if (node.nodeType === 1 && (node.classList.contains('mat-mdc-menu-content') || node.querySelector('.mat-mdc-menu-content'))) {
                    
                    const menuContent = node.classList.contains('mat-mdc-menu-content') ? node : node.querySelector('.mat-mdc-menu-content');
                    
                    if (menuContent && !menuContent.querySelector('.gemini-nsfw-switch-item')) {
                        
                        // --- 判斷邏輯 ---
                        // 1. 計算選項數量：主選單通常很大 (至少 6 個選項)
                        //    子選單 (說明、主題) 通常只有 3-4 個
                        const itemCount = menuContent.children.length;
                        
                        // 2. 檢查是否有「下一層選單的觸發器」：
                        //    主選單會有「主題 >」、「說明 >」這種帶箭頭的按鈕 (aria-haspopup="menu")
                        //    子選單已經是底層，不會有這個
                        const hasSubmenuTrigger = menuContent.querySelector('[aria-haspopup="menu"]');

                        // 條件：數量大於 5 個，或者 包含子選單觸發器
                        // (移除了 hasLinks 判斷，因為說明選單也有連結，會導致誤判)
                        if (itemCount > 5 || hasSubmenuTrigger) {
                            console.log(`Gemini Extension: Main Menu detected (Items: ${itemCount}), injecting switch...`);
                            
                            const divider = document.createElement('div');
                            divider.style.borderTop = '1px solid var(--md-sys-color-outline-variant)';
                            divider.style.margin = '8px 0';
                            
                            menuContent.insertBefore(divider, menuContent.firstChild);
                            menuContent.insertBefore(createSwitchItem(), menuContent.firstChild);
                        } else {
                            console.log(`Gemini Extension: Sub-menu detected (Items: ${itemCount}), ignored.`);
                        }
                    }
                }
            }
        }
    });

    menuObserver.observe(document.body, { childList: true, subtree: true });


    // =====================================
    // Part 2: 目錄導航邏輯 (保持不變)
    // =====================================
    try {
        const sidebarId = 'gemini-extension-toc';
        let sidebar = document.getElementById(sidebarId);
        
        if (!sidebar) {
            sidebar = document.createElement('div');
            sidebar.id = sidebarId;
            sidebar.className = 'gemini-toc-sidebar';
            sidebar.style.display = 'none'; 
            sidebar.innerHTML = `
                <div class="toc-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="gemini-icon">
                        <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"/>
                    </svg>
                    <span>對話導航</span>
                </div>
                <ul class="toc-list"></ul>
            `;
            document.body.appendChild(sidebar);
        }

        function updateList() {
            const list = sidebar.querySelector('.toc-list');
            if (!list) return;

            let targets = Array.from(document.querySelectorAll('[data-message-author-role="user"]'));
            if (targets.length === 0) targets = Array.from(document.querySelectorAll('user-query'));

            const validTargets = targets.filter(node => node.textContent.trim().length > 0);

            if (validTargets.length === 0) {
                sidebar.style.display = 'none'; return; 
            } else {
                sidebar.style.display = 'block'; 
            }

            if (list.children.length === validTargets.length) return;

            list.innerHTML = ''; 
            validTargets.forEach((msg, index) => {
                if (!msg.id) msg.id = `nav-item-${index}`;
                const li = document.createElement('li');
                const a = document.createElement('a');
                let text = msg.textContent.trim();
                if (text.length > 18) text = text.substring(0, 18) + '...';
                a.textContent = text || "(圖片/檔案)";
                a.href = 'javascript:void(0)';
                a.onclick = (e) => {
                    e.preventDefault();
                    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                };
                li.appendChild(a);
                list.appendChild(li);
            });
        }
        setInterval(updateList, 1500);
    } catch (e) {
        console.error("Gemini Extension Error (TOC):", e);
    }
})();