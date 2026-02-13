// =========================================
// Gemini Extension: Navigation + NSFW Toggle (V21 Context Menu Fix)
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
        
        // 使用原生 mat-icon + 打勾樣式
        const iconHtml = isNsfwEnabled 
            ? `<mat-icon role="img" class="mat-icon notranslate gds-icon-l google-symbols mat-ligature-font mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font" data-mat-icon-name="check_circle" style="color: var(--md-sys-color-primary);">check_circle</mat-icon>` 
            : ``; 

        btn.innerHTML = `
            <div class="gemini-nsfw-switch-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="opacity:0.7">
                   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
                </svg>
                <span>NSFW</span>
            </div>
            ${iconHtml}
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

    // 使用關鍵字辨識
    const menuObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1 && (node.classList.contains('mat-mdc-menu-content') || node.querySelector('.mat-mdc-menu-content'))) {
                    
                    const menuContent = node.classList.contains('mat-mdc-menu-content') ? node : node.querySelector('.mat-mdc-menu-content');
                    
                    if (menuContent && !menuContent.querySelector('.gemini-nsfw-switch-item')) {
                        
                        // 取得選單內的所有文字內容
                        const menuText = menuContent.textContent || "";
                        
                        // 核心判斷：關鍵字
                        // 主題選單一定包含 "深色" (Dark) 和 "淺色" (Light)
                        // 我們同時檢查中文和英文，確保不同語言設定下也能運作
                        const hasDarkOption = menuText.includes('深色') || menuText.includes('Dark');
                        const hasLightOption = menuText.includes('淺色') || menuText.includes('Light');
                        const hasSystemOption = menuText.includes('系統') || menuText.includes('System');

                        // 只有當選單同時包含「深色」與「淺色」選項時，才認定它是主題選單
                        // 這能完美排除「模型選擇器」(只有 Pro/Flash) 和「右鍵選單」(只有刪除/釘選)
                        const isThemeMenu = (hasDarkOption && hasLightOption) || (hasSystemOption && hasDarkOption);

                        if (isThemeMenu) {
                            console.log(`Gemini Extension: Theme Menu detected (Text Match), appending switch...`);
                            
                            const divider = document.createElement('div');
                            divider.style.borderTop = '1px solid var(--md-sys-color-outline-variant)';
                            divider.style.margin = '8px 0';
                            
                            menuContent.appendChild(divider);
                            menuContent.appendChild(createSwitchItem());
                            
                        } else {
                            // 這會過濾掉 模型選單、右鍵選單、主選單
                            // console.log(`Gemini Extension: Menu ignored (Not theme menu).`);
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