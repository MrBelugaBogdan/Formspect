document.addEventListener('DOMContentLoaded', () => {
    // Глобальний стан
    let elements = [];
    let selectedId = null;
    let canvasScale = 40; // пікселів на одиницю coordinates

    const canvasEl = document.getElementById('canvas');
    const paletteList = document.getElementById('element-list');
    const propsPanel = document.getElementById('props-content');
    const layerList = document.getElementById('layer-list');
    const btnGenerate = document.getElementById('btn-generate');
    const outputArea = document.getElementById('output-formspec');
    const btnDelete = document.getElementById('btn-delete-selected');
    const canvasWidthInput = document.getElementById('canvas-width');
    const canvasHeightInput = document.getElementById('canvas-height');
    const bgInput = document.getElementById('bg-color');
    const versionSelect = document.getElementById('formspec-version');

    // Нові елементи для експорту
    const exportTypeSelect = document.getElementById('export-type');
    const bookWrittenFields = document.getElementById('book-written-fields');
    const bookOwnerInput = document.getElementById('book-owner');
    const bookDescInput = document.getElementById('book-desc');
    const bookTextInput = document.getElementById('book-text');
    const bookTitleInput = document.getElementById('book-title');

    // Показати/сховати поля писаної книги
    exportTypeSelect.addEventListener('change', () => {
        if (exportTypeSelect.value === 'book_written') {
            bookWrittenFields.style.display = 'block';
        } else {
            bookWrittenFields.style.display = 'none';
        }
    });

    // Заповнити палітру
    ELEMENT_TYPES.forEach(typeObj => {
        const div = document.createElement('div');
        div.className = 'element-item';
        div.textContent = typeObj.label;
        div.draggable = true;
        div.dataset.type = typeObj.type;
        div.addEventListener('dragstart', handleDragStart);
        paletteList.appendChild(div);
    });

    // Drag & Drop на полотно
    canvasEl.addEventListener('dragover', e => e.preventDefault());
    canvasEl.addEventListener('drop', handleDrop);

    // Оновлення розміру полотна
    function updateCanvasSize() {
        const w = parseFloat(canvasWidthInput.value) || 10;
        const h = parseFloat(canvasHeightInput.value) || 8;
        canvasEl.style.width = (w * canvasScale) + 'px';
        canvasEl.style.height = (h * canvasScale) + 'px';
    }
    canvasWidthInput.addEventListener('input', updateCanvasSize);
    canvasHeightInput.addEventListener('input', updateCanvasSize);
    updateCanvasSize();

    // Drag start з палітри
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.type);
        e.dataTransfer.effectAllowed = 'copy';
    }

    // Додавання нового елемента при drop
    function handleDrop(e) {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain');
        const typeObj = ELEMENT_TYPES.find(t => t.type === type);
        if (!typeObj) return;

        const rect = canvasEl.getBoundingClientRect();
        const scaleX = canvasScale;
        const scaleY = canvasScale;
        const x = (e.clientX - rect.left) / scaleX;
        const y = (e.clientY - rect.top) / scaleY;

        const newEl = createElementData(typeObj);
        newEl.x = Math.max(0, Math.round(x * 10) / 10);
        newEl.y = Math.max(0, Math.round(y * 10) / 10);
        elements.push(newEl);
        selectElement(newEl.id);
        renderAll();
    }

    // Виділення елемента
    function selectElement(id) {
        selectedId = id;
        renderAll();
    }

    // Видалення вибраного
    function deleteSelected() {
        if (selectedId) {
            elements = elements.filter(el => el.id !== selectedId);
            selectedId = null;
            renderAll();
        }
    }
    btnDelete.addEventListener('click', deleteSelected);
    document.addEventListener('keydown', e => {
        if (e.key === 'Delete' && selectedId) {
            deleteSelected();
        }
    });

    // Оновлення списку шарів
    function updateLayerList() {
        layerList.innerHTML = '';
        const sorted = [...elements].sort((a,b) => a.zIndex - b.zIndex);
        sorted.forEach(el => {
            const li = document.createElement('li');
            li.textContent = `${el.type} (${el.label || el.name || ''})`;
            li.className = el.id === selectedId ? 'active-layer' : '';
            li.addEventListener('click', () => selectElement(el.id));
            layerList.appendChild(li);
        });
    }

    // Показати панель властивостей для вибраного
    function updatePropertiesPanel() {
        if (!selectedId) {
            propsPanel.innerHTML = '<p>Виберіть елемент на полотні</p>';
            return;
        }
        const el = elements.find(e => e.id === selectedId);
        if (!el) return;
        const typeDef = ELEMENT_TYPES.find(t => t.type === el.type);
        let html = `<strong>${typeDef.label}</strong>`;
        const props = typeDef.props;
        props.forEach(prop => {
            let value = el[prop] !== undefined ? el[prop] : '';
            html += `<label>${prop}:</label>`;
            if (prop === 'color' || prop === 'bgcolor') {
                html += `<input type="color" data-prop="${prop}" value="${value}" onchange="updateProperty(this)">`;
            } else if (prop === 'choices') {
                html += `<input type="text" data-prop="${prop}" value="${value}" onchange="updateProperty(this)" placeholder="через кому">`;
            } else if (prop === 'text' || prop === 'label' || prop === 'default') {
                html += `<textarea data-prop="${prop}" onchange="updateProperty(this)">${value}</textarea>`;
            } else {
                html += `<input type="text" data-prop="${prop}" value="${value}" onchange="updateProperty(this)">`;
            }
        });
        html += `<label>zIndex:</label><input type="number" data-prop="zIndex" value="${el.zIndex}" onchange="updateProperty(this)">`;
        propsPanel.innerHTML = html;
    }

    // Оновлення властивості (глобальна функція для onchange)
    window.updateProperty = function(input) {
        if (!selectedId) return;
        const el = elements.find(e => e.id === selectedId);
        if (!el) return;
        const prop = input.dataset.prop;
        let val = input.value;
        if (prop === 'zIndex' || prop === 'selected' || prop === 'columns' || prop === 'rows') val = Number(val);
        el[prop] = val;
        renderAll();
    };

    // Малювання полотна
    function renderCanvas() {
        canvasEl.innerHTML = '';
        const sorted = [...elements].sort((a,b) => a.zIndex - b.zIndex);
        sorted.forEach(el => {
            const div = document.createElement('div');
            div.className = 'canvas-element' + (el.id === selectedId ? ' selected' : '');
            div.style.left = (el.x * canvasScale) + 'px';
            div.style.top = (el.y * canvasScale) + 'px';
            div.style.width = (el.width * canvasScale) + 'px';
            div.style.height = (el.height * canvasScale) + 'px';
            div.style.zIndex = el.zIndex;
            div.dataset.id = el.id;

            let displayText = el.label || el.text || el.name || el.type;
            if (el.type === 'box') displayText = '';
            div.textContent = displayText;

            const delBtn = document.createElement('span');
            delBtn.className = 'delete-btn';
            delBtn.textContent = '×';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                elements = elements.filter(e => e.id !== el.id);
                if (selectedId === el.id) selectedId = null;
                renderAll();
            });
            div.appendChild(delBtn);

            div.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('delete-btn')) return;
                e.preventDefault();
                selectElement(el.id);

                const startX = e.clientX;
                const startY = e.clientY;
                const origLeft = el.x;
                const origTop = el.y;
                const scale = canvasScale;

                function onMouseMove(e) {
                    const dx = (e.clientX - startX) / scale;
                    const dy = (e.clientY - startY) / scale;
                    el.x = Math.max(0, origLeft + dx);
                    el.y = Math.max(0, origTop + dy);
                    renderCanvas();
                }
                function onMouseUp() {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                    renderAll();
                }
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });

            canvasEl.appendChild(div);
        });
    }

    function renderAll() {
        renderCanvas();
        updateLayerList();
        updatePropertiesPanel();
    }

    // Генерація з урахуванням типу експорту
    btnGenerate.addEventListener('click', () => {
        const w = canvasWidthInput.value;
        const h = canvasHeightInput.value;
        const ver = versionSelect.value;
        const bg = bgInput.value.trim();
        const exportType = exportTypeSelect.value;

        let bookFields = {};
        if (exportType === 'book_written') {
            bookFields = {
                owner: bookOwnerInput.value,
                desc: bookDescInput.value,
                text: bookTextInput.value,
                title: bookTitleInput.value
            };
        }

        const result = generateExportString(elements, w, h, ver, bg, exportType, bookFields);
        outputArea.value = result;
    });

    // Початкове відображення
    renderAll();
});
